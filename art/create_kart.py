"""Execute: blender --background --python art/create_kart.py"""
import bpy, math, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def material(name, color, metallic=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metallic;bs.inputs['Roughness'].default_value=.4
 return m
paint=material('Paint',(.55,.95,.16)); dark=material('Rubber',(.025,.035,.045));metal=material('Metal',(.35,.42,.46),.7);visor=material('Visor',(.04,.16,.22),.5)
def box(name,loc,size,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 mod=o.modifiers.new('Soft edges','BEVEL');mod.width=.12;mod.segments=2;o.modifiers.new('Normals','WEIGHTED_NORMAL');return o
# Blender -Y forward exports to glTF +Z forward.
box('Chassis',(0,0,.55),(1.65,2.35,.45),paint)
box('Nose',(0,-1.1,.42),(1.9,.5,.3),paint)
box('Rear bumper',(0,1.15,.45),(1.9,.22,.2),metal)
box('Seat',(0,.35,.95),(.85,.65,.9),dark)
box('Driver suit',(0,0,1.05),(.65,.5,.7),paint)
for x in [-.97,.97]:
 for y in [-.8,.8]:
  bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.38,depth=.32,location=(x,y,.38),rotation=(0,math.pi/2,0));bpy.context.object.data.materials.append(dark)
  bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=.2,depth=.34,location=(x,y,.38),rotation=(0,math.pi/2,0));bpy.context.object.data.materials.append(metal)
bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=.43,location=(0,0,1.65));bpy.context.object.data.materials.append(paint)
box('Visor',(0,-.36,1.67),(.62,.18,.22),visor)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'art','vale-kart.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(root,'public','models','vale-kart.glb'),export_format='GLB',export_apply=True)
