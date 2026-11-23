/**
 * Business logic helpers for teams, rosters, and fair-play validation.
 */

/** Validates whether accepted members count is within tournament requirements */
export function validateRosterSize(acceptedCount, minSize = 1, maxSize = 1){
  if(acceptedCount < minSize) return {valid:false, error:`Need at least ${minSize} player(s). Currently have ${acceptedCount}.`}
  if(acceptedCount > maxSize) return {valid:false, error:`Roster exceeds maximum allowed of ${maxSize} player(s). Currently have ${acceptedCount}.`}
  return {valid:true, error:null}
}

/** Determines if captain is allowed to mark roster as ready */
export function canSubmitRoster(acceptedCount, minSize = 1){
  return acceptedCount >= minSize
}

/** Fair-play rule: checks if a player is already confirmed on another active roster for the tournament */
export function hasTournamentRosterConflict(playerMemberships, targetTournamentId, currentRegistrationId = null){
  return (playerMemberships || []).some(m => {
    const reg = m.registrations
    if(!reg) return false
    // Ignore current team if re-checking self
    if(currentRegistrationId && reg.id === currentRegistrationId) return false
    // Ignore rejected or withdrawn teams
    if(['rejected','withdrawn'].includes(reg.status)) return false
    // If same tournament and status is accepted
    return reg.tournament_id === targetTournamentId && m.status === 'accepted'
  })
}

/** Checks whether a roster can be edited by the captain (must not be locked or approved) */
export function canModifyRoster(registration){
  if(!registration) return false
  if(registration.roster_locked) return false
  if(registration.status === 'approved') return false
  return true
}
