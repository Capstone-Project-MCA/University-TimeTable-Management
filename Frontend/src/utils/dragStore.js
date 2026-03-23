/**
 * dragStore.js
 * A simple module-level store for in-page drag-and-drop.
 * Bypasses dataTransfer.getData() cross-component reliability issues.
 */

let _draggedTicket = null;

export function setDraggedTicket(ticket) {
  _draggedTicket = ticket;
}

export function getDraggedTicket() {
  return _draggedTicket;
}

export function clearDraggedTicket() {
  _draggedTicket = null;
}
