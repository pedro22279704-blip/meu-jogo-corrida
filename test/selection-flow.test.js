import test from 'node:test';
import assert from 'node:assert/strict';
import {SELECTION_STAGES,previousSelectionStage,modeTracks,orderedCupTracks} from '../src/selection-flow.js';
import {createCup,advanceCup} from '../src/championship.js';
test('voltar percorre pista, piloto, carro e menu sem pular etapas',()=>{assert.deepEqual(SELECTION_STAGES,['home','cars','characters','tracks']);assert.equal(previousSelectionStage('tracks'),'characters');assert.equal(previousSelectionStage('characters'),'cars');assert.equal(previousSelectionStage('cars'),'home');assert.equal(previousSelectionStage('options'),'home');});
test('cada modo oferece apenas suas pistas e a escolha inicial mantém todas as etapas da copa',()=>{
 for(const mode of ['quick','training','classic','horizon']){const tracks=modeTracks(mode);assert.equal(tracks.length,mode==='classic'?2:mode==='horizon'?4:5);for(const first of tracks){const order=orderedCupTracks(tracks,first);assert.equal(order[0],first);assert.deepEqual([...order].sort(),[...tracks].sort());assert.deepEqual(tracks,modeTracks(mode));}}
 assert.throws(()=>orderedCupTracks(modeTracks('horizon'),'night'));
});
test('copa com início escolhido continua avançando pela ordem sem alterar os pontos',()=>{const cup=createCup('horizon'),points=[...cup.points];cup.tracks=orderedCupTracks(cup.tracks,'fair');assert.deepEqual(cup.tracks,['fair','sawmill','valley','harbor']);cup.results.push([]);assert.equal(advanceCup(cup),true);assert.equal(cup.tracks[cup.round],'sawmill');assert.deepEqual(cup.points,points);});
