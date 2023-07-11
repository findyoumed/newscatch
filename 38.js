let news = [];
let page = 1;
let total_page = 0;
let menus = document.querySelectorAll('.menus button');
console.log('menus=', menus);
menus.forEach((menu) =>
  menu.addEventListener('click', (event) => getNewsByTopic(event)),
);
let searchButton = document.getElementById('search-button');
console.log('버튼은?', searchButton);
let url;
//각 함수에서 필요한 url을 만든다
//api 호출 함수를 부른다
const getNews = async () => {
  try {
    let header = new Headers({
      'x-api-key': 'kCFphFME5daAxNK-89oML-jpKsXG2-gMZPC-AOc7nXQ',
    });
    console.log('url1=', url);
    url.searchParams.set('page', page); //&page= 를 추가하는 문구
    console.log('url2=', url);
    let response = await fetch(url, { headers: header });
    let data = await response.json();
    if (response.status == 200) {
      if (data.total_hits == 0) {
        throw new Error('검색된 결과값이 없습니다');
      }
      news = data.articles;
      console.log('news =', news);
      console.log('data =', data);
      total_page = data.total_pages;
      page = data.page;
      render();
      pagenation();
    } else {
      throw new Error(data.message);
    }
    console.log('response = ', response);
    console.log('data =', data);
  } catch (error) {
    console.log('error.message=', error.message);
    errorRender(error.message);
    //에러 종류. response.status 200 = Success
    //https://docs.newscatcherapi.com/api-docs/endpoints/search-news
  }
};

const getLatestNews = async () => {
  url = new URL(
    `https://api.newscatcherapi.com/v2/latest_headlines?countries=KR&topic=sport&page_size=10`,
  );
  getNews();
};

const getNewsByTopic = async (event) => {
  console.log('클릭됨', event.target.textContent.toLowerCase);
  let topic = event.target.textContent.toLowerCase();
  url = new URL(
    `https://api.newscatcherapi.com/v2/latest_headlines?countries=KR&page_size=10&topic=${topic}`,
  );
  getNews();
};

const getNewsByKeyword = async () => {
  console.log('getNewsByKeyword Search!');
  //1. 검색 키워드 읽어오기
  //2. url에 검색 키워드 붙이기
  //3. header 준비
  //4. url 부르기
  //5. 데이터 가져오기
  //6. 데이터 보여주기
  let keyword = document.getElementById('search-input').value;
  console.log('keyword=', keyword);
  url = new URL(
    `https://api.newscatcherapi.com/v2/search?q=${keyword}&page_size=20`,
  );
  getNews();
};

const render = () => {
  let newsHTML = '';
  newsHTML = news //array임
    .map((item) => {
      return `<!-- 뉴스를 보여주는 섹션 -->
    <div class="row news">
        <div class="col-lg-4">
            <!-- 그림 -->
            <img class="news-img-size" src="${item.media}"/>
        </div>
        <div class="col-lg-8">
            <!-- 글 -->
            <!-- <h2>국내 스포츠 종합 뉴스 사이트를 만들다!!!</h2> -->
            <h2>${item.title}</h2>
            <!-- <p>내가 원하는 뉴스만 골라주는 사이트를 공개합니다. API를 사용해서 만들어 보았습니다.</p> -->
            <p>
            ${item.summary}
            </p>
            <div>
                <!-- NewsCatcher * 2023-여름 -->
                ${item.rights} * ${item.published_date}
            </div>
        </div>
    </div>`;
    })
    .join('');
  console.log(newsHTML);
  document.getElementById('news-board').innerHTML = newsHTML;
};

const errorRender = (message) => {
  let errorHTML = `<div class="alert alert-danger text-center" role="alert">
  ${message}
  </div>`;
  document.getElementById('news-board').innerHTML = errorHTML;
};

const pagenation = () => {
  //https://getbootstrap.com/docs/5.2/components/pagination/
  //total page를 알아야함
  //내가 어떤 페이지를 보고 있는지
  //page group이 뭔지
  //last page가 뭔지
  //first page가 뭔지
  //first~last 페이지 프린트
  let pageGroup = Math.ceil(page / 5);
  let last = pageGroup * 5;
  if (last > total_page) {
    //마지막 그룹이 5개 이하이면,
    last = total_page;
  }
  // let first = last - 4;
  let first = last - 4 <= 0 ? 1 : last - 4; //첫그룹이 5이하이면

  let pagenationHTML = ``;
  //total page가 5보다 작을 경우, 페이지만 프린트 하는 법. last, first
  // << >> 버튼 만들어주기. 맨처음, 맨끝으로 가는 버튼 만들기
  // 내가 그룹 1일 때, << < 버튼이 없다
  // 내가 그룹 마지막 일 때 > >> 버튼이 없다

  if (first >= 6) {
    pagenationHTML = `
      <li class="page-item" onclick="moveToPage(1)">
          <a class="page-link" href='#'>&lt;&lt;</a>
      </li>
      <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(
          ${page - 1})">
              <span aria-hidden="true">&lt;</span>
          </a>
      </li>
    `;
  }

  for (let i = first; i <= last; i++) {
    pagenationHTML += `
      <li class="page-item 
      ${page == i ? 'active' : ''}">
        <a class="page-link" href="#" id='page-${i}' onclick="moveToPage(${i})">${i}</a>
      </li>
    `;
  }

  if (last < total_page) {
    pagenationHTML += `
      <li class="page-item">
      <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(
        ${page + 1})">
          <span aria-hidden="true">&gt;</span>
      </a>
    </li>
    <li class="page-item" onclick="moveToPage(${total_page})">
      <a class="page-link" href='#'>&gt;&gt;</a>
    </li>
  `;
  }

  document.querySelector('.pagination').innerHTML = pagenationHTML;
};

const moveToPage = (pageNum) => {
  //1. 이동하고 싶은 페이지를 알아야 합니다.
  //2. 이동하고 싶은 페이지를 가지고 api를 다시 호출해주자.
  page = pageNum;
  console.log('page=', page);
  getNews();
};
searchButton.addEventListener('click', getNewsByKeyword);
getLatestNews();
