import test from 'node:test'
import assert from 'node:assert/strict'
import {standings} from '../lib/standings.mjs'
import {stepIndex,myRecord,myStanding} from '../lib/progress.mjs'
import {validateRosterSize,canSubmitRoster,hasTournamentRosterConflict,canModifyRoster} from '../lib/teams.mjs'

const m=(a,b,x,y,s='final')=>({stage:'group',group_label:'A',team_a:a,team_b:b,score_a:x,score_b:y,status:s})
test('standings award 3/1/0 and sort by points then goal difference',()=>{
  const [[g,rows]]=standings([m('A','B',2,0),m('A','C',1,1),m('B','C',0,3),m('B','A',0,0,'upcoming')])
  assert.equal(g,'A');assert.deepEqual(rows.map(r=>[r.t,r.pts]),[['C',4],['A',4],['B',0]].sort((a,b)=>b[1]-a[1]).map(x=>x))
  assert.equal(rows[0].t,'C')
})
test('upcoming matches count for nobody',()=>{const [[,rows]]=standings([m('A','B',null,null,'upcoming')]);assert.equal(rows[0].pts,0)})
test('registration progress steps',()=>{
  const t={entry_fee_kes:1500,status:'open'}
  assert.equal(stepIndex({status:'pending'},t),0);assert.equal(stepIndex({status:'approved',paid:false},t),1)
  assert.equal(stepIndex({status:'approved',paid:true},t),2);assert.equal(stepIndex({status:'approved',paid:true},{...t,status:'live'}),3)
  assert.equal(stepIndex({status:'rejected'},t),-1)
})
test('player record and group position are matched by team name',()=>{
  const r={team_name:'Kings',gamertags:['k1']},ms=[m('Kings','X',3,1),m('Y','Kings',2,2)]
  assert.deepEqual(myRecord(r,ms),{w:1,d:1,l:0});assert.equal(myStanding(r,ms).pos,1)
})

test('team roster size enforcement (5 starters + 1 sub)', ()=>{
  assert.equal(validateRosterSize(4, 5, 6).valid, false)
  assert.equal(validateRosterSize(5, 5, 6).valid, true)
  assert.equal(validateRosterSize(6, 5, 6).valid, true)
  assert.equal(validateRosterSize(7, 5, 6).valid, false)
})

test('team ready submission gate', ()=>{
  assert.equal(canSubmitRoster(3, 5), false)
  assert.equal(canSubmitRoster(5, 5), true)
  assert.equal(canSubmitRoster(6, 5), true)
})

test('fair play: prevent single player on multiple tournament teams', ()=>{
  const memberships = [
    {status: 'accepted', registrations: {id: 'r1', tournament_id: 't-valorant', status: 'pending'}},
    {status: 'accepted', registrations: {id: 'r2', tournament_id: 't-eafc', status: 'approved'}}
  ]
  // Trying to join another team in t-valorant -> conflict
  assert.equal(hasTournamentRosterConflict(memberships, 't-valorant'), true)
  // Trying to join a different tournament -> no conflict
  assert.equal(hasTournamentRosterConflict(memberships, 't-apex'), false)
  // Withdrawn/rejected teams don't block
  const withdrawnMemberships = [
    {status: 'accepted', registrations: {id: 'r1', tournament_id: 't-valorant', status: 'withdrawn'}}
  ]
  assert.equal(hasTournamentRosterConflict(withdrawnMemberships, 't-valorant'), false)
})

test('roster lock protects team modification upon approval', ()=>{
  assert.equal(canModifyRoster({status: 'pending', roster_locked: false}), true)
  assert.equal(canModifyRoster({status: 'approved', roster_locked: true}), false)
  assert.equal(canModifyRoster({status: 'pending', roster_locked: true}), false)
})
