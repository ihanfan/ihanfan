const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// [電影陣列(放全部清單裡的電影)]
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// render means:資料經過處理後變成html元素, 放到 DOM Tree or HTML裡
// why data?: 不同情境下可使用 ex: 
// 改導演清單const directors = [] 直接在function裡改成directors
function renderMovieList(data) {
  // 函式盡量只做一件事就好 keep simple
  let rawHTML = '' // 字串 負責裝解析data產生的HTML

  // 中間段是處理data過程  item > 每個item都是單一部電影
  data.forEach((item) => {
    // 下面 (+=) means: 把每個item 產生新的HTML code >一個個movie串在後面
    // 目前需要每部電影的 image & title, 回到HTML要render的元素剪下貼在這
    // 有些東西需動態產生 ex:image隨電影不同而改變, 如下<img src="" & <h5 class="card-title"> </h5> 裡面改掉 
    // 因為是從收藏清單中移除收藏的電影 把下面btn btn-info btn-add-favorite 改成 btn-danger btn-remove-favorite
    rawHTML += ` <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}" >More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">-</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

// [宣告含式] | id 從哪來? 從index_url 抓到的電影清單, 每部電影都會綁一個id 

// { id: 1, title: 'Jurassic World: Fallen Kingdom', genres: Array(3), description: 'Several years after the demise of Jurassic World, …event the extinction of the dinosaurs once again.', release_date: '2018-06-06', … }

// { id: 2, title: 'Ant-Man and the Wasp', genres: Array(5), description: "As Scott Lang awaits expiration of his term of hou…with intentions of stealing Dr. Pym's inventions.", release_date: '2018-07-04', … }


// (id裡絕對不會重複, 如想找單一一部電影最可靠就是從id找)
// [去修改html裡的東西 從index.html裡去看要綁的東西]
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}
// id 沒有綁在每部電影的more 按鈕上, 如何綁在按鈕上?上面render > rawHTML裡的button 有data開頭的 都是dataset，data-bs-toggle="modal" data - bs - target="#movie-modal" [加上 data - id="${item.id}"]  再點擊事件裡(dataPanel.addLi..)抓到data-id="${item.id}的id

// 下面remove函式要做的事跟 add差不多，把list從localStorage拿出來減掉這個元素，再把list塞回去
function removeFromFavorite(id) {
  // 上方已拿過localStorage: const movies = JSON.parse(localStorage.getItem('favoriteMovies')) 下方的const list =...不需要
  // const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  // 要怎麼到下面的movie 會是movies 陣列裡的第幾個元素呢?
  // movie改movieIndex find(回傳被找到的元素)變findIndex函式: 回傳index這個元素的位置 
 const movieIndex = movies.findIndex((movie) => movie.id === id)
  
  // 確認movieIndex是否能使用:return console.log(movieIndex) 點remove按鈕 > devtool console裡回傳正確位置

  // 當你要把一個元素從陣列拿掉時
  // ex: [1,2,3,4,5] 移掉3 但是要知道他的位置在哪
  // 有一個function: splice | Array.splice() < 1.括號裡要知道哪個位置開始移除元素 2.要刪除幾個元素
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  // 重整頁面才能看到結果，無法及時更新顯示的電影清單?
  // last step: 呼叫renderMovieList 然後把movie傳進去 點擊remove按鈕 就馬上被刪掉了，同時在devtool > application > localStorage > favorite裡刪除的資料也跟著不見了
   renderMovieList(movies)
}




// html裡的modal-body 改寫成javascript
// step 1:綁定事件 綁在dataPanel的上面 > 'click' 點擊到more按鈕時 除顯示modal外,還要把modal裡的元素改掉(當下那部電影的資料)
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // .bt-show-movie 點擊到show movie button 才會改modal 的資料
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id)) // devtool裡id式字串 前面加個number id變數字

    // 再綁一個(-)按鈕
  } else if (event.target.matches('.btn-remove-favorite')) {

    // 電影加入藏，先在dataPanel上寫一個 function removeF...的函式。並記得在rawHTML += ` <div class="col-sm-3">裡btn-add-favorite 後綁一個id
    removeFromFavorite(Number(event.target.dataset.id))
  }
})
//method(2): dataPanel.addEventListener('click', event(匿名含式) => {console.error('Error')} 和上面的差異?
// method(2) 較難debug 在devtool裡無法得知error是在哪產生的 ex: Error>(anonymous(匿名含式)@index.js:40)   而第一個在devtool會產生 ex: error>onPanelClicked@index.js:36

// 最後記得呼叫
renderMovieList(movies)