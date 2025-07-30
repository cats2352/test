// 필터 카테고리 목록
const FILTERS = [
  { key: 'all', label: '전체', file: 'all.json' },
  { key: '비전서', label: '비전서', file: '비전서.json' },
  { key: '솜사탕', label: '솜사탕', file: '솜사탕.json' },
  { key: '경험치', label: '경험치', file: '경험치.json' },
  { key: '초진재료', label: '초진재료', file: '초진재료.json', hasSubFilter: true },
  { key: '필살책', label: '필살책', file: '필살책.json' },
  { key: '증표', label: '증표', file: '증표.json' },
  { key: '제전서', label: '제전서', file: '제전서.json' },
  { key: '상한서', label: '상한서', file: '상한서.json' },
  { key: '기타', label: '기타', file: '기타.json' },
];

// 2차 필터 목록 (초진재료용)
const SUB_FILTERS = [
  { key: 'all', label: '전체' },
  { key: '유대결전', label: '유대결전' },
  { key: '트레저맵', label: '트레저맵' },
  { key: '해적제', label: '해적제' },
  { key: '기타', label: '기타' },
];

const filterBar = document.getElementById('filterBar');
const itemList = document.getElementById('itemList');
const itemDetail = document.getElementById('itemDetail');

let currentFilter = 'all';
let currentSubFilter = 'all';
let currentData = [];
let searchKeyword = '';
let sortAsc = true;

// 필터바 렌더링 (디자인 반영)
function renderFilterBar() {
  filterBar.innerHTML = '';

  // 필터 제목
  const title = document.createElement('div');
  title.className = 'filter-title';
  title.textContent = '필터';
  filterBar.appendChild(title);

  // 검색창
  const search = document.createElement('input');
  search.className = 'filter-search';
  search.type = 'text';
  search.placeholder = '필 검색...';
  search.value = searchKeyword;
  search.oninput = (e) => {
    searchKeyword = e.target.value;
    renderItemList(filterAndSort(currentData));
  };
  filterBar.appendChild(search);

  // 정렬 제목
  const sortTitle = document.createElement('div');
  sortTitle.className = 'filter-section-title';
  sortTitle.textContent = '정렬';
  filterBar.appendChild(sortTitle);

  // 정렬 행
  const sortRow = document.createElement('div');
  sortRow.className = 'filter-sort-row';

  // 카테고리 셀렉트박스
  const select = document.createElement('select');
  select.className = 'filter-select';
  FILTERS.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.key;
    opt.textContent = f.label;
    if (currentFilter === f.key) opt.selected = true;
    select.appendChild(opt);
  });
  select.onchange = (e) => {
    currentFilter = e.target.value;
    currentSubFilter = 'all'; // 2차 필터 초기화
    const f = FILTERS.find(f => f.key === currentFilter);
    loadData(f.file);
  };
  sortRow.appendChild(select);

  // 정렬 방향 버튼
  const sortBtn = document.createElement('button');
  sortBtn.className = 'sort-btn';
  sortBtn.title = sortAsc ? '오름차순' : '내림차순';
  sortBtn.innerHTML = sortAsc ? '↓<sub>9</sub>' : '↑<sub>0</sub>';
  sortBtn.onclick = () => {
    sortAsc = !sortAsc;
    renderItemList(filterAndSort(currentData));
    renderFilterBar();
  };
  sortRow.appendChild(sortBtn);

  filterBar.appendChild(sortRow);

  // 2차 필터 (초진재료 선택 시에만 표시)
  if (currentFilter === '초진재료') {
    const subFilterTitle = document.createElement('div');
    subFilterTitle.className = 'filter-section-title';
    subFilterTitle.textContent = '세부 분류';
    subFilterTitle.style.marginTop = '20px';
    filterBar.appendChild(subFilterTitle);

    const subFilterRow = document.createElement('div');
    subFilterRow.className = 'filter-sort-row';

    const subSelect = document.createElement('select');
    subSelect.className = 'filter-select';
    SUB_FILTERS.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.key;
      opt.textContent = f.label;
      if (currentSubFilter === f.key) opt.selected = true;
      subSelect.appendChild(opt);
    });
    subSelect.onchange = (e) => {
      currentSubFilter = e.target.value;
      renderItemList(filterAndSort(currentData));
    };
    subFilterRow.appendChild(subSelect);

    filterBar.appendChild(subFilterRow);
  }
}

// 검색+정렬+2차필터 적용된 데이터 반환
function filterAndSort(data) {
  let filtered = data;
  
  // 검색 필터링
  if (searchKeyword.trim()) {
    filtered = filtered.filter(item => item.Name && item.Name.includes(searchKeyword.trim()));
  }
  
  // 2차 필터링 (초진재료일 때만)
  if (currentFilter === '초진재료' && currentSubFilter !== 'all') {
    filtered = filtered.filter(item => item.ModeClass === currentSubFilter);
  }
  
  // 번호 기준 정렬 (idx+1)
  filtered = filtered.map((item, idx) => ({...item, __idx: idx+1}));
  filtered.sort((a, b) => sortAsc ? a.__idx - b.__idx : b.__idx - a.__idx);
  return filtered;
}

// 아이템 리스트 렌더링
function renderItemList(data) {
  itemList.innerHTML = '';
  if (!data || data.length === 0) {
    itemList.innerHTML = '<div style="color:#aaa; padding:40px; text-align:center;">아이템이 없습니다.</div>';
    return;
  }
  data.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.onclick = () => openItemDetailModal(item, item.__idx || idx+1);

    // 썸네일 이미지
    const thumb = document.createElement('img');
    thumb.className = 'item-thumb';
    thumb.src = item.tuimg;
    thumb.alt = item.Name;
    card.appendChild(thumb);

    // 아이템 번호 (썸네일 좌측상단)
    const number = document.createElement('div');
    number.className = 'item-number';
    number.textContent = 'NO.' + (item.__idx || idx + 1);
    card.appendChild(number);

    // 아이템 이름 (번호 하단)
    const info = document.createElement('div');
    info.className = 'item-info';
    const name = document.createElement('div');
    name.className = 'item-name';
    name.textContent = item.Name;
    info.appendChild(name);
    card.appendChild(info);

    itemList.appendChild(card);
  });
}

// 데이터 로드
async function loadData(file) {
  try {
    // 전체 필터일 때는 모든 카테고리 json을 합쳐서 표시
    if (file === 'all.json') {
      // all.json 대신, 다른 모든 카테고리 파일을 fetch
      const files = FILTERS.filter(f => f.key !== 'all').map(f => f.file);
      const allData = [];
      for (const f of files) {
        try {
          const res = await fetch('src/db/' + f + '?v=' + Date.now());
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) allData.push(...data);
          }
        } catch (e) { /* 개별 파일 에러 무시 */ }
      }
      currentData = allData;
      renderItemList(filterAndSort(allData));
      itemDetail.style.display = 'none';
      renderFilterBar();
      return;
    }
    // 기존 단일 파일 로드
    const res = await fetch('src/db/' + file + '?v=' + Date.now()); // 캐시 방지
    if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.');
    const data = await res.json();
    currentData = data;
    renderItemList(filterAndSort(data));
    itemDetail.style.display = 'none'; // 세부정보창 숨김
    renderFilterBar();
  } catch (e) {
    itemList.innerHTML = '<div style="color:#f66; padding:40px; text-align:center;">데이터 로드 실패</div>';
  }
}

// 모달(세부정보창) 열기 (URL 변경 없음)
function openItemDetailModal(item, number) {
  showItemDetail(item, number);
}
// 모달 닫기 (URL 변경 없음)
function closeItemDetailModal() {
  itemDetail.style.display = 'none';
}
// 아이템 클릭 시 세부정보창 표시 (통일된 구조)
function showItemDetail(item, number) {
  // 이미지 경로 정규화 (GitHub Pages 호환성)
  let imageSrc = item.maimg || '';
  if (imageSrc && !imageSrc.startsWith('http')) {
    // GitHub Pages에서 올바른 경로로 변환
    if (imageSrc.startsWith('test/')) {
      // test/로 시작하는 경로는 그대로 유지 (GitHub Pages 프로젝트 루트 기준)
      imageSrc = imageSrc;
    } else if (!imageSrc.startsWith('/')) {
      // 상대 경로인 경우 test/ 접두사 추가
      imageSrc = 'test/' + imageSrc;
    }
  }
  
  // 안전한 데이터 처리
  const itemName = item.Name || '알 수 없는 아이템';
  const itemDescription = item.Description || '설명이 없습니다.';
  const itemGetIt = item['Get it'] || '획득처 정보가 없습니다.';
  
  itemDetail.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <button onclick="closeItemDetailModal()" class="back-btn">←</button>
        <div class="modal-title">${itemName}</div>
      </div>
      <div class="modal-body">
        <div class="modal-img-section">
          <img src="${imageSrc}" alt="${itemName}" class="maimg" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <div style="display:none; color:#aaa; text-align:center; padding:20px;">이미지를 불러올 수 없습니다.</div>
        </div>
        <div class="modal-info-section">
          <div class="info-item">
            <span class="info-label">설명</span>
            <span class="info-value">${itemDescription}</span>
          </div>
          <div class="info-item">
            <span class="info-label">획득처</span>
            <span class="info-value">${itemGetIt}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  itemDetail.style.display = 'flex';
}
// popstate 이벤트 제거 (GitHub Pages 호환성)
// window.addEventListener('popstate', () => { ... }); // 제거
// 페이지 진입 시 URL 체크 제거 (GitHub Pages 호환성)
// window.addEventListener('DOMContentLoaded', () => { ... }); // 제거

// 초기화
renderFilterBar();
loadData('all.json'); 