"""Recria seis karts articulados e objetos do vale: blender -b -P art/create_kart.py."""
import bpy, math, os
from mathutils import Vector
bpy.context.preferences.filepaths.save_version=0
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public','models')
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,metallic=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metallic;p.inputs['Roughness'].default_value=.5;return m
rubber=mat('Rubber',(.025,.035,.045));metal=mat('Metal',(.38,.46,.5),.6);glass=mat('Visor',(.025,.09,.14),.4);cream=mat('Cream',(.92,.85,.62));wood=mat('Wood',(.35,.17,.07));leaf=mat('Leaf',(.08,.35,.25));crystal=mat('Crystal',(.1,.7,.68),.3)
def group(name,loc=(0,0,0),parent=None):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc;return o
def finish(o,name,loc,size,material,parent):
 o.name=name;o.location=loc;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material);o.parent=parent;return o
def box(name,loc,size,material,parent=None):
 bpy.ops.mesh.primitive_cube_add(size=1);o=finish(bpy.context.object,name,loc,size,material,parent);m=o.modifiers.new('Rounded edges','BEVEL');m.width=min(size)*.2;m.segments=2;o.modifiers.new('Normals','WEIGHTED_NORMAL');return o
def sphere(name,loc,size,material,parent=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8);return finish(bpy.context.object,name,loc,size,material,parent)
def cylinder(name,loc,radius,depth,material,parent=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=radius,depth=depth);o=bpy.context.object;o.name=name;o.location=loc;o.data.materials.append(material);o.parent=parent;return o
def export(root,path):
 bpy.ops.object.select_all(action='DESELECT');root.select_set(True)
 for o in root.children_recursive:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,path),export_format='GLB',use_selection=True,export_apply=True)
colors=[(.55,.95,.16),(.95,.22,.4),(.95,.65,.12),(.48,.32,.9),(.12,.72,.8),(.95,.35,.12)]
names=['Lume','Bia','Teo','Nina','Zeca','Sol']
for i in range(6):
 root=group('Kart_'+names[i]);paint=mat('Paint_'+names[i],colors[i]);accent=mat('Suit_'+names[i],colors[(i+2)%6]);
 root.location.x=i*4
 # Geometrias diferentes, dentro do mesmo envelope de colisão.
 shape=sphere if i in [0,3] else box
 shape('Body', (0,0,.6),(1.7,2.3,.55),paint,root)
 if i==1:box('Sport nose',(0,-.9,.55),(1.1,1,.35),paint,root)
 elif i==2:
  for x in [-.65,.65]:box('Recycled side panel',(x,0,.72),(.28,1.8,.45),wood,root)
 elif i==3:sphere('Bubble hood',(0,-.7,.7),(1.4,1,.55),accent,root)
 elif i==4:
  for x in [-.6,.6]:cylinder('Turbine',(x,.75,.8),.23,.6,metal,root)
 else:box('Front shield',(0,-1,.55),(1.75,.35,.32),accent,root)
 box('Rear bumper',(0,1.18,.43),(1.9,.18,.18),metal,root)
 if i in [1,3,5]:
  box('Wing',(0,1,1.05),(1.8,.4,.12),accent,root)
  for x in [-.6,.6]:box('Wing support',(x,1,.8),(.1,.1,.45),metal,root)
 box('Seat',(0,.35,.95),(.8,.6,.85),rubber,root)
 for side,x in [('L',-.96),('R',.96)]:
  for axle,y in [('F',-.8),('B',.8)]:
   steer=group('Steer_'+axle+side,(x,y,.38),root);roll=group('Roll_'+axle+side,parent=steer)
   wheel=cylinder('Tire',(0,0,0),.37,.32,rubber,roll);wheel.rotation_euler.y=math.pi/2
   hub=cylinder('Hub',(0,0,0),.19,.34,metal,roll);hub.rotation_euler.y=math.pi/2
   box('Spoke',(0,0,0),(.35,.3,.06),accent,roll)
 driver=group('Driver',(0,.15,.85),root)
 sphere('Suit',(0,0,.24),(.7,.5,.65 if i%2 else .73),accent,driver)
 head=group('Head',(0,-.04,.8 if i%2 else .88),driver)
 shape('Helmet',(0,0,0),(.82,.8,.7+i%3*.06),paint,head)
 box('Visor',(0,-.36,.02),(.62,.17,.23),glass,head)
 # Silhueta única de cada piloto.
 if i==0:box('Crest',(0,0,.42),(.15,.5,.18),cream,head)
 elif i==1:
  for x in [-.4,.4]:sphere('Ear pod',(x,0,0),(.22,.3,.3),cream,head)
 elif i==2:box('Goggles',(0,-.42,.04),(.65,.1,.16),metal,head)
 elif i==3:
  for x in [-.28,.28]:box('Antenna',(x,0,.48),(.08,.08,.38),cream,head)
 elif i==4:box('Helmet brim',(0,-.27,.3),(.95,.65,.09),cream,head)
 else:
  for x in [-.2,0,.2]:box('Flame fin',(x,0,.4),(.08,.4,.25),accent,head)
 for side,x in [('L',-.4),('R',.4)]:
  arm=group('Arm_'+side,(x,-.05,.43),driver)
  box('Sleeve',(0,-.17,-.12),(.2,.43,.22),accent,arm)
  sphere('Glove',(0,-.38,-.12),(.22,.22,.22),cream,arm)
 steering=group('Steering',(0,-.48,1.1),root)
 bpy.ops.mesh.primitive_torus_add(major_radius=.27,minor_radius=.045,major_segments=16,minor_segments=6)
 o=bpy.context.object;o.name='Steering wheel';o.parent=steering;o.rotation_euler.x=math.radians(40);o.data.materials.append(rubber)
 original=root.location.copy();root.location=(0,0,0);export(root,'kart-'+str(i)+'.glb');root.location=original
# Objetos originais do cenário, com exportações individuais para reutilização.
props=group('ValeProps');props.location=(0,8,0)
def prop(name):return group(name,parent=props)
tree=prop('Tree');cylinder('Trunk',(0,0,1.5),.4,3,wood,tree)
for z,size in [(3,3.2),(4.3,2.6),(5.3,1.8)]:sphere('Crown',(0,0,z),(size,size,2.2),leaf,tree)
for x in [-1,1]:sphere('Fruit',(x,-.8,3.8),(.35,.35,.35),cream,tree)
portal=prop('Portal')
for x in [-8,8]:box('Pillar',(x,0,3.5),(.65,.8,7),metal,portal)
box('Arch',(0,0,7),(16.6,.8,1),leaf,portal)
for x in range(-7,8,2):box('Arch light',(x,.45,7),(.8,.1,.3),cream,portal)
sign=prop('Sign');box('Post',(0,0,1.6),(.2,.2,3.2),wood,sign);box('Board',(0,0,2.8),(3,.3,1.2),leaf,sign)
for x in [-.5,0,.5]:
 o=box('Arrow',(x,.2,2.8),(.55,.1,.16),cream,sign);o.rotation_euler.y=math.pi/4
stand=prop('Grandstand')
for row in range(3):
 box('Bench',(0,row*.9,.5+row*.6),(8,1,.35),wood,stand)
 for x in range(-3,4):sphere('Spectator',(x,row*.9,1+row*.6),(.4,.4,.65),cream if x%2 else leaf,stand)
bridge=prop('Bridge');box('Deck',(0,0,-.9),(17,8,.5),wood,bridge)
for x in [-6,6]:box('Pier',(x,0,-3),(.8,1.2,6),metal,bridge)
for x in [-8,8]:
 box('Rail',(x,0,.8),(.2,8,.2),cream,bridge)
 for y in [-3,0,3]:box('Post',(x,y,.3),(.25,.25,1),wood,bridge)
tunnel=prop('Tunnel')
for x in [-8.5,8.5]:box('Wall',(x,0,5.5),(.8,12,11),metal,tunnel)
box('Roof',(0,0,11),(18,12,.6),leaf,tunnel)
for y in [-5,0,5]:box('Ceiling light',(0,y,10.6),(5,.2,.12),cream,tunnel)
for item in props.children:
 # Export only this prop, using a zeroed parent so locations remain local.
 original=props.location.copy();props.location=(0,0,0);export(item,'prop-'+item.name.lower()+'.glb');props.location=original
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art','vale-kart.blend'))
