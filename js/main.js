const STORAGE_KEY = "roomCheckmateChecklists";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupCreateChecklist();
  renderChecklistList();
});

function setupNavigation() {
  const navButtons = document.querySelectorAll("[data-page]");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });
}

function showPage(pageName) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  const targetPage = document.getElementById(`${pageName}Page`);
  if (targetPage) {
    targetPage.classList.add("active");
  }

  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((button) => {
    button.classList.remove("active-nav");

    if (button.dataset.page === pageName) {
      button.classList.add("active-nav");
    }
  });

  if (pageName === "manage") {
    renderChecklistList();
  }
}

function setupCreateChecklist() {
  const createButton = document.getElementById("createChecklistBtn");

  createButton.addEventListener("click", () => {
    const roomType = getSelectedValue("roomType");
    const contractType = getSelectedValue("contractType");
    const title = document.getElementById("checklistTitle").value.trim();

    if (!roomType) {
      alert("매물 유형을 선택해주세요.");
      return;
    }

    if (!contractType) {
      alert("계약 유형을 선택해주세요.");
      return;
    }

    if (!title) {
      alert("체크리스트 이름을 입력해주세요.");
      return;
    }

    const now = getTodayString();

    const checklist = {
      id: Date.now(),
      checklistTitle: title,
      room: {
        roomType,
        contractType
      },
      housingCost: {
        managementFee: 0,
        rentCost: 0,
        deposit: 0,
        includedItems: {
          electricity: false,
          water: false,
          gas: false,
          heating: false,
          internet: false,
          tv: false
        },
        description: ""
      },
      evaluationItems: [],
      customItems: [],
      memo: {
        itemName: "",
        content: ""
      },
      evaluationResult: {
        totalScore: 0,
        groupScores: {},
        topRatedItemCount: 0
      },
      createdDate: now,
      modifiedDate: now
    };

    const checklists = loadChecklists();
    checklists.push(checklist);
    saveChecklists(checklists);

    alert("체크리스트가 생성되었습니다.");

    document.getElementById("checklistTitle").value = "";
    clearRadio("roomType");
    clearRadio("contractType");

    showPage("manage");
  });
}

function getSelectedValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : null;
}

function clearRadio(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  if (selected) {
    selected.checked = false;
  }
}

function loadChecklists() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  return savedData ? JSON.parse(savedData) : [];
}

function saveChecklists(checklists) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
}

function renderChecklistList() {
  const listArea = document.getElementById("checklistList");
  if (!listArea) return;

  const checklists = loadChecklists();

  if (checklists.length === 0) {
    listArea.innerHTML = "<p>생성된 체크리스트가 없습니다.</p>";
    return;
  }

  listArea.innerHTML = checklists
    .map((checklist, index) => {
      return `
        <div class="checklist-card">
          <strong>${index + 1}. ${checklist.checklistTitle}</strong>
          <p>${checklist.room.roomType} / ${checklist.room.contractType}</p>
          <p>첫 생성 날짜: ${checklist.createdDate}</p>
          <p>최종 수정 날짜: ${checklist.modifiedDate}</p>
        </div>
      `;
    })
    .join("");
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}