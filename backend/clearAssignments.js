// Script to clear volunteer assignments for play4sudan event (ID: 6)
const { promisePool } = require('./db');

async function clearAssignments() {
  try {
    console.log('Connecting to database...');
    const [result] = await promisePool.query('DELETE FROM VolunteerHistory WHERE EventID = 6');
    console.log('Volunteers unassigned from play4sudan event:', result.affectedRows);
    console.log('You can now reassign volunteers to this event.');
  } catch (err) {
    console.error('Error clearing assignments:', err);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

clearAssignments(); 