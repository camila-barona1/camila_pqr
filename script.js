const addBox = document.querySelector(".add-box"),
  popupBox = document.querySelector(".popup-box"),
  popupTitle = popupBox.querySelector("header p"),
  closeIcon = popupBox.querySelector("header i"),
  titleTag = popupBox.querySelector("input"),
  descTag = popupBox.querySelector("textarea"),
  addBtn = popupBox.querySelector("button");

// Array of month names
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
  "Agosto", "Septiembre", "Octobre", "Noviembre", "Diciembre"];

// Retrieve notes from localStorage or initialize an empty array
const notes = JSON.parse(localStorage.getItem("notes") || "[]");

// Flags and ID for note updates
let isUpdate = false, updateId;

// Open the popup box to add a new note
addBox.addEventListener("click", () => {
  popupTitle.innerText = "Nueva PQR";
  addBtn.innerText = "Agregar PQR";
  popupBox.classList.add("show");
  document.querySelector("body").style.overflow = "hidden";
  if (window.innerWidth > 660) titleTag.focus();
});

// Close the popup box and reset fields
closeIcon.addEventListener("click", () => {
  isUpdate = false;
  titleTag.value = descTag.value = "";
  popupBox.classList.remove("show");
  document.querySelector("body").style.overflow = "auto";
  imageInput.value = "";
  imagePreview.src = "";
  imagePreview.style.display = "none";
  imageData = "";
});

const imageInput = popupBox.querySelector('input[type="file"]');
const imagePreview = popupBox.querySelector('.row.image img');
let imageData = "";

imageInput.addEventListener("change", function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageData = e.target.result;
      imagePreview.src = imageData;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    imageData = "";
    imagePreview.src = "";
    imagePreview.style.display = "none";
  }
});

// Display existing notes from localStorage
function showNotes() {
  if (!notes) return;
  document.querySelectorAll(".note").forEach(li => li.remove());
  notes.forEach((note, id) => {
    let filterDesc = note.description.replaceAll("\n", '<br/>');
    let imgTag = note.image ? `<img src='${note.image}' style='max-width:100%;margin-top:10px;'/>` : "";
    let timeTag = note.time ? `<span class='note-time'>${note.time}</span>` : "";
    let statusColor = {
      "Received": "#bdbdbd",
      "In progress": "#54a2bf",
      "Resolved": "#4caf50",
      "Rejected": "#e57373"
    }[note.status || "Received"];
    let statusText = {
      "Received": "Recibido",
      "In progress": "En progreso",
      "Resolved": "Resuelto",
      "Rejected": "Rechazado"
    }[note.status || "Received"];
    // Status dropdown for card
    let statusDropdown = `<select class='note-status-dropdown' data-id='${id}' style='background:${statusColor};color:#fff;border:none;border-radius:8px;padding:3px 8px;font-size:13px;font-weight:600;box-shadow:0 2px 8px rgba(84,162,191,0.08);margin-bottom:6px;'>
      <option value='Received' ${note.status==="Received"?"selected":""}>Recibido</option>
      <option value='In progress' ${note.status==="In progress"?"selected":""}>En progreso</option>
      <option value='Resolved' ${note.status==="Resolved"?"selected":""}>Resuelto</option>
      <option value='Rejected' ${note.status==="Rejected"?"selected":""}>Rechazado</option>
    </select>`;
    let liTag = `<li class="note">
                        <div class="details">
                            <p>${note.title}</p>
                            <span>${filterDesc}</span>
                            ${imgTag}
                        </div>
                        <div class="bottom-content">
                            ${statusDropdown}
                            <span class="note-date-time">${note.date} ${timeTag}</span>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="menu">
                                    <li onclick="updateNote(${id}, '${note.title}', '${filterDesc}', '${note.image || ''}')"><i class="uil uil-pen"></i>Editar</li>
                                    <li onclick="deleteNote(${id})"><i class="uil uil-trash"></i>Eliminar</li>
                                </ul>
                            </div>
                        </div>
                    </li>`;
    addBox.insertAdjacentHTML("afterend", liTag);
  });
  // Add event listeners for status dropdowns
  document.querySelectorAll('.note-status-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', function() {
      const idx = parseInt(this.getAttribute('data-id'));
      notes[idx].status = this.value;
      localStorage.setItem("notes", JSON.stringify(notes));
      showNotes();
    });
  });
}

showNotes();

// Show menu options for each note
function showMenu(elem) {
  elem.parentElement.classList.add("show");
  document.addEventListener("click", e => {
    if (e.target.tagName != "I" || e.target != elem) {
      elem.parentElement.classList.remove("show");
    }
  });
}

// Custom delete popup logic
let deleteNoteId = null;
const deletePopupBox = document.querySelector('.delete-popup-box');
const deleteConfirmBtn = document.querySelector('.delete-confirm');
const deleteCancelBtn = document.querySelector('.delete-cancel');

function showDeletePopup(noteId) {
  deleteNoteId = noteId;
  deletePopupBox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

deleteConfirmBtn.addEventListener('click', function() {
  if (deleteNoteId !== null) {
    notes.splice(deleteNoteId, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
    deleteNoteId = null;
  }
  deletePopupBox.style.display = 'none';
  document.body.style.overflow = 'auto';
});

deleteCancelBtn.addEventListener('click', function() {
  deleteNoteId = null;
  deletePopupBox.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Delete a specific note
function deleteNote(noteId) {
  showDeletePopup(noteId);
}

// Update a specific note
function updateNote(noteId, title, filterDesc, image) {
  let description = filterDesc.replaceAll('<br/>', '\r\n');
  updateId = noteId;
  isUpdate = true;
  addBox.click();
  titleTag.value = title;
  descTag.value = description;
  imageData = image || "";
  imagePreview.src = imageData;
  imagePreview.style.display = imageData ? "block" : "none";
  popupTitle.innerText = "Update a Note";
  addBtn.innerText = "Update Note";
}

// Add or update a note on button click
addBtn.addEventListener("click", e => {
  e.preventDefault();
  let title = titleTag.value.trim(),
    description = descTag.value.trim();
  // status removed from form
  let status = notes[updateId]?.status || "Received";
  if (title || description || imageData) {
    let currentDate = new Date(),
      month = months[currentDate.getMonth()],
      day = currentDate.getDate(),
      year = currentDate.getFullYear(),
      hours = currentDate.getHours(),
      minutes = currentDate.getMinutes().toString().padStart(2, '0'),
      ampm = hours >= 12 ? 'PM' : 'AM',
      hour12 = ((hours % 12) || 12).toString();
    let formattedTime = `${hour12}:${minutes} ${ampm}`;
    let noteInfo = {
      title,
      description,
      date: `${month} ${day}, ${year}`,
      time: formattedTime,
      image: imageData,
      status
    };
    if (!isUpdate) {
      notes.push(noteInfo);
    } else {
      isUpdate = false;
      notes[updateId] = noteInfo;
    }
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
    closeIcon.click();
  }
});