/**
 * dragStore.js
 * A simple module-level store for in-page drag-and-drop AND ticket focus/selection.
 * Bypasses dataTransfer.getData() cross-component reliability issues.
 *
 * --- Ticket Focus (new) ---
 * When a user clicks any ticket (from sidebar OR grid), we store it as
 * the "focused ticket".  TimetableGrid subscribes and switches into
 * "faculty overlay mode": it overlays the grid with that faculty's
 * existing schedule so the user can spot free slots instantly.
 */

let _draggedTicket  = null;
let _selectedTicket = null;
let _focusedTicket  = null;   // ticket the user last clicked/selected for faculty-overlay mode

const listeners = new Set();

function notify() {
  listeners.forEach(l => l({
    dragged:  _draggedTicket,
    selected: _selectedTicket,
    focused:  _focusedTicket,
  }));
}

/* ── dragged ──────────────────────────────────────────────────────────────── */
export function setDraggedTicket(ticket) {
  _draggedTicket = ticket;
  if (ticket) _selectedTicket = ticket; // dragging implicitly selects
  notify();
}
export function getDraggedTicket()  { return _draggedTicket; }
export function clearDraggedTicket() {
  _draggedTicket = null;
  notify();
}

/* ── selected ─────────────────────────────────────────────────────────────── */
export function setSelectedTicket(ticket) {
  // Toggle off if same
  if (_selectedTicket && ticket && _selectedTicket.ticketId === ticket.ticketId) {
    _selectedTicket = null;
  } else {
    _selectedTicket = ticket;
  }
  notify();
}
export function getSelectedTicket() { return _selectedTicket; }
export function clearSelectedTicket() {
  _selectedTicket = null;
  notify();
}

/* ── focused ticket (faculty-overlay mode) ────────────────────────────────── */
/**
 * Call this whenever the user clicks on a ticket card (sidebar or grid).
 * Pass `null` to clear the overlay.
 * Stores the minimal ticket shape needed for the overlay:
 *   { ticketId, facultyUID, courseCode, section, type, lectureNo, day, time }
 */
export function setFocusedTicket(ticket) {
  if (_focusedTicket && ticket && _focusedTicket.ticketId === ticket.ticketId) {
    // Toggle: clicking the same ticket again clears the overlay
    _focusedTicket = null;
  } else {
    _focusedTicket = ticket;
  }
  notify();
}
export function getFocusedTicket()   { return _focusedTicket; }
export function clearFocusedTicket() {
  _focusedTicket = null;
  notify();
}

/* ── subscribe ────────────────────────────────────────────────────────────── */
export function subscribeDragStore(listener) {
  listeners.add(listener);
  listener({ dragged: _draggedTicket, selected: _selectedTicket, focused: _focusedTicket });
  return () => listeners.delete(listener);
}
