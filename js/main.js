const STORAGE_KEY = "roomCheckmateChecklists";

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    createChecklist();
    renderChecklistList();
    setupGroupTabs();
    addCustomItem()
    setupScoreCalculation();
    saveChecklist();
    renderCompareChecklistList();
    setupCompareTotalScore();
    setupCompareTopRated();
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

function createChecklist() {
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

        alert(
            "체크리스트가 생성되었습니다.\n\n" +
            "평가 내용을 입력한 뒤 저장 버튼을 눌러주세요.\n" +
            "저장 버튼을 누르지 않으면 체크리스트가 저장되지 않습니다."
        );

        document.getElementById("checklistTitle").value = "";
        clearRadio("roomType");
        clearRadio("contractType");
        resetEvaluationForm();
        setCurrentChecklist(checklist);
        showEvaluationHeader(checklist);
        showPage("evaluation");
    });
}

function resetEvaluationForm() {
    document.querySelectorAll("#evaluationPage input[type='radio']")
        .forEach((input) => {
            input.checked = false;
        });

    document.querySelectorAll("#evaluationPage input[type='checkbox']")
        .forEach((input) => {
            input.checked = false;
        });

    document.querySelectorAll("#evaluationPage input[type='text']")
        .forEach((input) => {
            input.value = "";
        });

    document.querySelectorAll("#evaluationPage input[type='number']")
        .forEach((input) => {
            input.value = "";
        });

    document.querySelectorAll("#evaluationPage textarea")
        .forEach((textarea) => {
            textarea.value = "";
        });

    const customList = document.getElementById("customItemList");

    if (customList) {
        customList.innerHTML =
            '<p class="empty-custom-text">추가된 사용자 맞춤 항목이 없습니다.</p>';
    }
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
            const title = checklist.checklistTitle || "제목 없음";
            const roomType = checklist.room?.roomType || "매물 유형 없음";
            const contractType = checklist.room?.contractType || "계약 유형 없음";
            const createdDate = checklist.createdDate || "-";
            const modifiedDate = checklist.modifiedDate || "-";

            return `
  <div class="checklist-card">
    <strong>${index + 1}. ${title}</strong>
    <p>${roomType} / ${contractType}</p>
    <p>첫 생성 날짜: ${createdDate}</p>
    <p>최종 수정 날짜: ${modifiedDate}</p>

    <button
      type="button"
      class="delete-checklist-btn"
      data-id="${checklist.id}">
      삭제
    </button>
  </div>
`;
        })
        .join("");

    document.querySelectorAll(".delete-checklist-btn").forEach((button) => {
        button.addEventListener("click", () => {
            deleteChecklist(Number(button.dataset.id));
        });
    });
}

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}`;
}

function setCurrentChecklist(checklist) {
    localStorage.setItem("currentChecklist", JSON.stringify(checklist));
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

function addCustomItem() {
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
        removeCustomItem(card, listArea);
    });

    listArea.appendChild(card);
}

function removeCustomItem(card, listArea) {
    card.remove();

    if (document.querySelectorAll(".custom-item-card").length === 0) {
        listArea.innerHTML =
            '<p class="empty-custom-text">추가된 사용자 맞춤 항목이 없습니다.</p>';
    }
}

const SCORE_MAP = {
    "상": 5,
    "중": 3,
    "하": 1,
    "가까움": 5,
    "보통": 3,
    "멀음": 1
};

const SCORE_GROUPS = {
    B: [
        "waterPressure", "hotWater", "electricLevel",
        "toiletDrain", "sinkDrain", "kitchenDrain", "bathDrain",
        "wallLevel", "floorLevel", "wallpaperLevel",
        "furnitureLevel", "optionLevel"
    ],
    D: [
        "sunlightLevel", "noiseLevel", "vibrationLevel", "slopeLevel", "ventilationLevel"
    ],
    E: [
        "roadCondition", "roadAccess", "parkingLevel",
        "busDistanceLevel", "subwayDistanceLevel",
        "educationDistance", "dislikedDistance", "convenienceDistance"
    ]
};

function setupScoreCalculation() {
    const scoreButton = document.getElementById("calculateTotalScoreBtn");
    if (!scoreButton) return;

    scoreButton.addEventListener("click", () => {
        const result = calculateTotalScore();

        alert(
            `총점수: ${result.totalScore} / 125점\n` +
            `상위 평가 항목 개수: ${result.topRatedItemCount}개\n\n` +
            `B그룹: ${result.groupScores.B}점\n` +
            `D그룹: ${result.groupScores.D}점\n` +
            `E그룹: ${result.groupScores.E}점`
        );
    });
}

function calculateTotalScore() {
    const groupScores = {};
    let totalScore = 0;
    let topRatedItemCount = 0;

    Object.keys(SCORE_GROUPS).forEach((groupTitle) => {
        let groupScore = 0;

        SCORE_GROUPS[groupTitle].forEach((name) => {
            const selected = document.querySelector(`input[name="${name}"]:checked`);
            if (!selected) return;

            const score = convertToScore(selected.value);
            groupScore += score;

            if (score === 5) {
                topRatedItemCount += 1;
            }
        });

        groupScores[groupTitle] = groupScore;
        totalScore += groupScore;
    });

    return {
        totalScore,
        groupScores,
        topRatedItemCount
    };
}

function saveChecklist() {
    const saveButton = document.getElementById("saveChecklistBtn");
    if (!saveButton) return;

    saveButton.addEventListener("click", () => {
        const currentChecklistData = localStorage.getItem("currentChecklist");

        if (!currentChecklistData) {
            alert("저장할 체크리스트가 없습니다.");
            return;
        }

        const checklist = JSON.parse(currentChecklistData);

        checklist.modifiedDate = getTodayString();
        checklist.housingCost = getHousingCostData();
        checklist.evaluationItems = getEvaluationItemsData();
        checklist.customItems = getCustomItemsData();
        checklist.evaluationResult = calculateTotalScore();
        checklist.memo = {
            itemName: document.getElementById("memoItemName")?.value.trim() || "",
            content: document.getElementById("memoContent")?.value.trim() || ""
        };

        const checklists = loadChecklists();

        const existingIndex = checklists.findIndex(
            (item) => item.id === checklist.id
        );

        if (existingIndex >= 0) {
            checklists[existingIndex] = checklist;
        } else {
            checklists.push(checklist);
        }

        saveChecklists(checklists);
        localStorage.setItem("currentChecklist", JSON.stringify(checklist));

        alert("체크리스트가 저장되었습니다.");
        renderChecklistList();
        renderCompareChecklistList();
    });
}

function getHousingCostData() {
    const costInputs = document.querySelectorAll("#groupA .cost-input");

    return {
        managementFee: Number(costInputs[0]?.value || 0),
        rentCost: Number(costInputs[2]?.value || 0),
        deposit: Number(costInputs[3]?.value || 0),
        description: "",
        includedItems: {
            electricity: document.querySelector('#groupA input[type="checkbox"]:nth-of-type(1)')?.checked || false,
            water: document.querySelector('#groupA input[type="checkbox"]:nth-of-type(2)')?.checked || false,
            gas: document.querySelector('#groupA input[type="checkbox"]:nth-of-type(3)')?.checked || false,
            heating: document.querySelector('#groupA input[type="checkbox"]:nth-of-type(4)')?.checked || false,
            internet: document.querySelector('#groupA input[type="checkbox"]:nth-of-type(5)')?.checked || false,
            tv: document.querySelector('#groupA input[type="checkbox"]:nth-of-type(6)')?.checked || false
        }
    };
}

function getEvaluationItemsData() {
    const groups = ["groupB", "groupC", "groupD", "groupE"];
    const evaluationItems = [];

    groups.forEach((groupId) => {
        const group = document.getElementById(groupId);
        if (!group) return;

        const groupTitle = group.querySelector("h3")?.textContent || "";

        const checkedInputs = group.querySelectorAll("input:checked");

        checkedInputs.forEach((input) => {
            const itemCell = input.closest(".detail-cell")?.previousElementSibling;
            const itemName = itemCell?.textContent.trim() || "";

            evaluationItems.push({
                itemName,
                groupTitle,
                description: "",
                isRequiredItem: !itemCell?.querySelector(".custom-mark"),
                evaluationLevel: input.value
            });
        });
    });

    return evaluationItems;
}

function getCustomItemsData() {
    const cards = document.querySelectorAll(".custom-item-card");

    return Array.from(cards).map((card) => {
        const customGroupTitle = card.querySelector("strong")?.textContent.trim() || "";
        const content = card.querySelector(".custom-item-content")?.textContent.trim() || "";
        const [customName, evaluationLevel] = content.split("/").map((text) => text.trim());

        return {
            customName,
            customGroupTitle,
            evaluationLevel
        };
    });
}

function convertToScore(level) {
    return SCORE_MAP[level] || 0;
}

function deleteChecklist(checklistId) {
    const confirmDelete = confirm("해당 체크리스트를 삭제하시겠습니까?");

    if (!confirmDelete) return;

    const checklists = loadChecklists();
    const updatedChecklists = checklists.filter(
        (checklist) => checklist.id !== checklistId
    );

    saveChecklists(updatedChecklists);
    renderChecklistList();
    renderCompareChecklistList();

    alert("체크리스트가 삭제되었습니다.");
}

function generateCompareResult(checklists, comparisonType) {
  if (comparisonType === "totalScore") {
    return checklists.map((checklist) => ({
        checklistTitle: checklist.checklistTitle,
        roomType: checklist.room?.roomType || "-",
        contractType: checklist.room?.contractType || "-",
        totalScore: checklist.evaluationResult?.totalScore || 0,
        housingCost: checklist.housingCost
    }));
  }

  if (comparisonType === "topRated") {
    return checklists.map((checklist) => ({
      checklistTitle: checklist.checklistTitle,
      groupTopRatedCounts: calculateTopRatedCounts(checklist)
    }));
  }

  return [];
}

function renderCompareChecklistList() {
    const listArea = document.getElementById("compareChecklistList");
    if (!listArea) return;

    const checklists = loadChecklists();

    if (checklists.length === 0) {
        listArea.innerHTML = "<p>저장된 체크리스트가 없습니다.</p>";
        return;
    }

    listArea.innerHTML = checklists
        .map((checklist, index) => {
            return `
  <label class="compare-checklist-item">
    <span class="compare-list-number">${index + 1}</span>

    <div class="compare-list-info">
      <strong>${checklist.checklistTitle}</strong>
      <small>${checklist.room?.roomType || "-"} / ${checklist.room?.contractType || "-"}</small>
    </div>

    <input class="compare-select-checkbox" type="checkbox" value="${checklist.id}">
  </label>
`;
        })
        .join("");
}

function setupCompareTotalScore() {
    const button = document.getElementById("compareTotalScoreBtn");
    if (!button) return;

    button.addEventListener("click", () => {
        const selectedChecklists = getSelectedCompareChecklists();

        if (selectedChecklists.length < 2) {
            alert("비교할 체크리스트를 최소 2개 이상 선택해주세요.");
            return;
        }

        if (selectedChecklists.length > 3) {
            alert("체크리스트는 최대 3개까지 비교할 수 있습니다.");
            return;
        }

        const compareResult = generateCompareResult(selectedChecklists, "totalScore");
        renderTotalScoreResult(compareResult);
        showPage("compareTotalScore");
    });
}

function getSelectedCompareChecklists() {
    const selectedIds = Array.from(
        document.querySelectorAll("#compareChecklistList input[type='checkbox']:checked")
    ).map((input) => Number(input.value));

    const checklists = loadChecklists();

    return checklists.filter((checklist) =>
        selectedIds.includes(checklist.id)
    );
}

function renderTotalScoreResult(compareResult) {
  const resultArea = document.getElementById("totalScoreResultList");
  if (!resultArea) return;

  resultArea.innerHTML = compareResult
    .map((result) => {
      const housingCost = result.housingCost || {};
      const managementFee = housingCost.managementFee || 0;
      const rentCost = housingCost.rentCost || 0;
      const deposit = housingCost.deposit || 0;
      const housingCostText = `${rentCost} / ${managementFee} / ${deposit}`;

      return `
        <div class="house-result-card">
          <img class="house-frame-img" src="./assets/right-house-frame.png" alt="집 모양 결과 카드">

          <div class="house-result-content">
            <h3>[${result.checklistTitle}]</h3>
            <p>${result.roomType} / ${result.contractType}</p>
            <p class="cost-info">주거비용 : ${housingCostText}</p>
            <p>총점수 : ${result.totalScore}점</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function setupCompareTopRated() {
    const button = document.getElementById("compareTopRatedBtn");
    if (!button) return;

    button.addEventListener("click", () => {
        const selectedChecklists = getSelectedCompareChecklists();

        if (selectedChecklists.length < 2) {
            alert("비교할 체크리스트를 최소 2개 이상 선택해주세요.");
            return;
        }

        if (selectedChecklists.length > 3) {
            alert("체크리스트는 최대 3개까지 비교할 수 있습니다.");
            return;
        }

        const compareResult = generateCompareResult(selectedChecklists, "topRated");
        renderTopRatedResult(compareResult);
        showPage("compareTopRated");
    });
}

const TOP_RATED_GROUP_TOTALS = {
    B: 12,
    D: 5,
    E: 8
};

function calculateTopRatedCounts(checklist) {
    const result = {
        B: 0,
        D: 0,
        E: 0
    };

    if (!checklist.evaluationItems) return result;

    checklist.evaluationItems.forEach((item) => {
        if (convertToScore(item.evaluationLevel) !== 5) return;

        if (item.groupTitle.includes("B.")) {
            result.B += 1;
        } else if (item.groupTitle.includes("D.")) {
            result.D += 1;
        } else if (item.groupTitle.includes("E.")) {
            result.E += 1;
        }
    });

    return result;
}

function renderTopRatedResult(compareResult) {
  const resultArea = document.getElementById("topRatedResultList");
  if (!resultArea) return;

  resultArea.innerHTML = compareResult
    .map((result) => {
      const counts = result.groupTopRatedCounts;
      const totalTopRated = counts.B + counts.D + counts.E;

      return `
        <div class="house-result-card">
          <img class="house-frame-img" src="./assets/right-house-frame.png" alt="집 모양 결과 카드">

          <div class="house-result-content top-rated-content">
            <h3>[${result.checklistTitle}]</h3>
            <p>B그룹 : ${counts.B} / 총 ${TOP_RATED_GROUP_TOTALS.B}개</p>
            <p>D그룹 : ${counts.D} / 총 ${TOP_RATED_GROUP_TOTALS.D}개</p>
            <p>E그룹 : ${counts.E} / 총 ${TOP_RATED_GROUP_TOTALS.E}개</p>
            <p class="top-rated-total">총 상위 평가 : ${totalTopRated}개</p>
          </div>
        </div>
      `;
    })
    .join("");
}