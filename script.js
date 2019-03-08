class DragAndDropManager {
  constructor(dragClass, dropClass) {
    this.dragClass = dragClass;
    this.dropClass = dropClass;
    let self = this;

    document.body.onmousedown = function(evt) {
      self.onMouseDown(evt);
    };

    document.body.onmousemove = function(evt) {
      self.onMouseMove(evt);
    };

    document.body.onmouseup = function(evt) {
      self.onMouseUp(evt);
    };
  }

  onMouseDown({target, clientX, clientY}) {
    if (!target.classList.contains(this.dragClass)) return;

    this.draggableInfo = {
      draggable: target,
      shifts: getClickShifts(),
      initialStage: getInitialState()
    };

    onDragStart();
    this.onMouseMove(arguments[0]);

    function getClickShifts() {
      let targetCoords = target.getBoundingClientRect();
      let targetStyle = getComputedStyle(target);

      return {
        shiftX: clientX - targetCoords.left,
        shiftY: clientY - targetCoords.top
      };
    }

    function getInitialState() {
      let targetStyle = getComputedStyle(target);

      return {
        position: targetStyle.position,
        left: targetStyle.left,
        top: targetStyle.top,
        parent: target.parentElement,
        nextElt: target.nextElementSibling
      };
    }

    function onDragStart() {
      target.style.position = 'absolute';
      target.style.zIndex = '1000';
      document.body.appendChild(target);
    }
  }

  onMouseMove({pageX, pageY}) {
    let info = this.draggableInfo;

    if (!info) return;

    let shifts = info.shifts;
    let drag = info.draggable;

    drag.style.left = `${pageX - shifts.shiftX}px`;
    drag.style.top = `${pageY - shifts.shiftY}px`;
  }

  onMouseUp({target, clientX, clientY}) {
    if (!this.draggableInfo) return;

    let self = this;
    let pointElt = getDropOnUp();

    if (pointElt.classList.contains(this.dropClass)) {
      revertInitialStage();
      pointElt.appendChild(target);
    } else {
      let initial = self.draggableInfo.initialStage;
      let drag = self.draggableInfo.draggable;

      revertInitialStage();
      initial.parent.insertBefore(drag, initial.nextElt);
    }

    this.draggableInfo = null;

    function getDropOnUp() {
      target.remove();
      let pointElt = document.elementFromPoint(clientX, clientY);
      document.body.appendChild(target);
      return pointElt;
    }

    function revertInitialStage() {
      let info = self.draggableInfo;
      target.style.position = info.initialStage.position;
      target.style.left = info.initialStage.left;
      target.style.top = info.initialStage.top;
    }
  }
}
