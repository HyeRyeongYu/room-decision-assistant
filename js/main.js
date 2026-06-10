const STORAGE_KEY = "roomCheckmateChecklists";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupCreateChecklist();
  renderChecklistList();
  setupGroupTabs();
  setupCustomItem();
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
  checklistTitle: title,
  room: {
    roomType,
    contractType
  },
  housingCost: {
    managementFee: 0,
    rentCost: 0,
    deposit: 0,
    description: "",
    includedItems: {
      electricity: false,
      water: false,
      gas: false,
      heating: false,
      internet: false,
      tv: false
    }
  },
  evaluationItems: [],
  customItems: [],
  maxCustomItemCount: 5,
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

// FileData.loadFromLocalStorage()
    const checklists = loadChecklists();
    // FileData.addChecklist(checklist)
    checklists.push(checklist);
    // FileData.saveToLocalStorage(checklists)
    saveChecklists(checklists);

    alert("체크리스트가 생성되었습니다.");

    document.getElementById("checklistTitle").value = "";
    clearRadio("roomType");
    clearRadio("contractType");

    setCurrentChecklist(checklist);
    showEvaluationHeader(checklist);
    showPage("evaluation");
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
// FileData.loadFromLocalStorage()
function loadChecklists() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  return savedData ? JSON.parse(savedData) : [];
}
// FileData.saveToLocalStorage()
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

function setCurrentChecklist(checklist) {
  localStorage.setItem("currentChecklistId", checklist.id);
}

function showEvaluationHeader(checklist) {
  const roomInfo = document.getElementById("evaluationRoomInfo");

  if (!roomInfo) return;

  roomInfo.textContent = `[${checklist.checklistTitle} / ${checklist.room.roomType} / ${checklist.room.contractType}]`;
}

function setupGroupTabs() {
  const groupButtons = document.querySelectorAll(".group-btn");

  groupButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const groupName = button.dataset.group;
      if (!groupName) return;

      groupButtons.forEach((btn) => btn.classList.remove("active-group"));
      button.classList.add("active-group");

      const groups = document.querySelectorAll(".eval-group");
      groups.forEach((group) => group.classList.remove("active-eval-group"));

      const targetGroup = document.getElementById(`group${groupName}`);
      if (targetGroup) {
        targetGroup.classList.add("active-eval-group");
      }
    });
  });
}

function setupCustomItem() {
  const addButton = document.getElementById("addCustomItemBtn");
  if (!addButton) return;

  addButton.addEventListener("click", () => {
    const groupTitle = document.getElementById("customGroupTitle").value.trim();
    const customName = document.getElementById("customItemName").value.trim();
    const level = getSelectedValue("customLevel");

    if (!groupTitle) {
      alert("맞춤 그룹명을 입력해주세요.");
      return;
    }

    if (!customName) {
      alert("맞춤 항목명을 입력해주세요.");
      return;
    }

    if (!level) {
      alert("상태 정도를 선택해주세요.");
      return;
    }

    const currentItems = document.querySelectorAll(".custom-item-card");

    if (currentItems.length >= 5) {
      alert("사용자 맞춤 항목은 최대 5개까지 추가할 수 있습니다.");
      return;
    }

    addCustomItemCard(groupTitle, customName, level);

    document.getElementById("customGroupTitle").value = "";
    document.getElementById("customItemName").value = "";
    clearRadio("customLevel");
  });
}

function addCustomItemCard(groupTitle, customName, level) {
  const listArea = document.getElementById("customItemList");
  if (!listArea) return;

  const emptyText = listArea.querySelector(".empty-custom-text");
if (emptyText) {
  emptyText.remove();
}

  const card = document.createElement("div");
  card.className = "custom-item-card";

  card.innerHTML = `
  <div class="custom-item-header">
    <strong>${groupTitle}</strong>
    <button type="button" class="delete-custom-btn">삭제</button>
  </div>

  <p class="custom-item-content">${customName} / ${level}</p>
`;

  card.querySelector(".delete-custom-btn").addEventListener("click", () => {
    card.remove();

    if (document.querySelectorAll(".custom-item-card").length === 0) {
  listArea.innerHTML =
    '<p class="empty-custom-text">추가된 사용자 맞춤 항목이 없습니다.</p>';
}

  });

  listArea.appendChild(card);
}