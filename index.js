const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

// [電影陣列(放全部清單裡的電影)]
const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}


// renderPaginator函式: 先知道總共幾部電影 > 去判斷要分幾頁
// ()裡傳入的參數是電影的數量 > (amount)
function renderPaginator(amount) {

  // 先把全部電影算出來 > 80 / 12 = 6頁 餘數(剩下電影)是8 = 7頁 *只要有小數點無條件進位*
  // Math.ceil函式來處理進位這件事
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  // for迴圈
  for (let page = 1; page <= numberOfPages; page++) {
    // 希望render出來 html paginator ul裡的li的數量 = 他的總頁數 ex:總共7頁
    // 下方把 html paginator > li元素複製過來<li class="page-item"><a class="page-link" href="#">1</a></li> 
    // ${page+1} 因為 上方 let page 是 0
    // 可改寫成 let page = 1; page <= num... > ${page}
    // 在瀏覽器點擊頁數要讓他知道我們點的是哪一頁(li)，在下方綁一個li的data，1;綁在 <a> 超連結元素上  <a>超連結有點像按鈕 <li>是外觀上的東西
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  // last step: | 下方完成後就可以把 index.html裡靜態頁面刪掉
  paginator.innerHTML = rawHTML
}


// 下面的函式，當輸入page 會回傳該page的電影資料 ex:回傳page是1，給第一頁該顯示哪12部電影給我
// slice函式: 切割陣列的一部份 then 回傳回來，slice 有2個傳入的參數 (1.start 2.end) 分別是切割的起點 和 終點
function getMoviesByPage(page) {
  // movies (2 meanings): 1.80部完整電影清單movies 2.被使用者搜尋出來的電影filteredMovies 這兩這必須被分頁 什麼時候該分80部電影? 什麼時候該使用者搜尋後的電影清單: *取決於當下有沒有在做搜尋 下方data可能是movies 或 filteredMovies
  // filteredMovies 裡有電影就放filteredMovies 但 如果filteredMovies是空的就放movies
  const data = filteredMovies.length ? filteredMovies : movies

  // 起點: 當page是1，應該要回傳 0-11部電影 | page2 就是 12-23
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

// [id裡的電影找出，再丟進localStorage]
function addToFavorite(id) {
  // isMovieIdMatched 會等於 add...(id)時 > return...
  // return 的 movie 是 isMovieId..函式的參數
  // === id 這個id是 add..Fav..這個函式傳進來的id
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }

  // 把localStorage 裡的東西拿出| 2種情況:1.有以收藏的清單 2.null ||(或) [](空陣列)
  // localStorage 只能存字串，用JSON.parsec會把 get item 字串 轉成JavaScript 的 物件或陣列 
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // 找電影 2 method 1.迴圈把每部電影拿出對id，想要的id 把它抓出來
  // method 1.迴圈把每部電影拿出對id，是想要的id 把它抓出來| 用find()函式，參數是()裡帶一個函式
  // movie.find的movie是一個陣列裡面有全部80部電影抓出then丟到上面isMovieIdMatched函式去做檢查
  // const movie = movies.find(isMovieIdMatched) < 括號可以改成箭頭函式 上方的 function isMovieIdMatched(movie) {return movie.id === id} 就可以刪掉
  const movie = movies.find((movie) => movie.id === id)

  // some 跟 find 很像: find是回傳元素本身，some較單純 想知道list陣列到底有無()裡的元素，如有true 沒有false
  if (list.some((movie) => movie.id === id)) {
    return alert('電影已在收藏親單中!')
  }

  // NEXT 把這部電影推到上方list裡面
  list.push(movie)
  // console.log(list)
  // 印出[{…}] 點第二部點影的收藏button: (2) [{…}, {…}] 如連續點擊相同電影(5) [{…}, {…}, {…}, {…}, {…}] 會把重複電影家進去 如果有重複電影return掉

  //localStorage setItem 上面的favoriteMovies 把list用JSON.stringify轉成字串丟進localStorage
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

  // const jsonString = JSON.stringify(list)
  // console.log('json string: ', jsonString)
  // console.log('json object: ', JSON.parse(jsonString))
  // json string:  [{"id":5,"title":"Mission: Impossible - Fallout","genres":[2,1,17],"description":"When an IMF mission ends badly, the world is faced with dire consequences. As Ethan Hunt takes it upon himself to fulfil his original briefing, the CIA begin to question his loyalty and his motives. The IMF team find themselves in a race against time, hunted by assassins while trying to prevent a global catastrophe.","release_date":"2018-07-25","image":"80PWnSTkygi3QWWmJ3hrAwqvLnO.jpg"}]
  // json object:  [{… }] 0:description:"When an IMF mission ends badly, the world is faced with dire consequences. As Ethan Hunt takes it upon himself to fulfil his original briefing, the CIA begin to question his loyalty and his motives. The IMF team find themselves in a race against time, hunted by assassins while trying to prevent a global catastrophe." genres:(3)[2, 1, 17]id:5 image:"80PWnSTkygi3QWWmJ3hrAwqvLnO.jpg"... [[Prototype]]:Object length:1[[Prototype]]:Array(0)


  // console.log(JSON.stringify(list)) 用console.log裡的函式會把javascript的資料變JSON字串
  // devtool 印出[{"id":5,"title":"Mission: Impossible - Fallout","genres":[2,1,17],"description":"When an IMF mission ends badly, the world is faced with dire consequences. As Ethan Hunt takes it upon himself to fulfil his original briefing, the CIA begin to question his loyalty and his motives. The IMF team find themselves in a race against time, hunted by assassins while trying to prevent a global catastrophe.","release_date":"2018-07-25","image":"80PWnSTkygi3QWWmJ3hrAwqvLnO.jpg"}] < localStorage裡的資料長這樣

}

// html裡的modal-body 改寫成javascript
// step 1:綁定事件 綁在dataPanel的上面 > 'click' 點擊到more按鈕時 除顯示modal外,還要把modal裡的元素改掉(當下那部電影的資料)
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // .bt-show-movie 點擊到show movie button 才會改modal 的資料
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id)) // devtool裡id式字串 前面加個number id變數字

    // 再綁一個收藏按鈕
  } else if (event.target.matches('.btn-add-favorite')) {

    // 電影加入藏，先在dataPanel上寫一個 function addToFa...的函式。並記得在rawHTML += ` <div class="col-sm-3">裡btn-add-favorite 後綁一個id
    addToFavorite(Number(event.target.dataset.id))
  }
})
//method(2): dataPanel.addEventListener('click', event(匿名含式) => {console.error('Error')} 和上面的差異?
// method(2) 較難debug 在devtool裡無法得知error是在哪產生的 ex: Error>(anonymous(匿名含式)@index.js:40)   而第一個在devtool會產生 ex: error>onPanelClicked@index.js:36

// 共render3次之二: 按paginator時
// 寫監聽器，
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果點擊的target的tagName不是A，A:<a></a>元素 then 直接return
  if (event.target.tagName !== 'A') return

  // event.target.dataset.page 太長給他一個變數 const，Number是轉成數字
  const page = Number(event.target.dataset.page)

  // 當我點擊頁數時，應該要把MovieList 重 新 render > 去顯示正確頁數的電影 
  // renderMovieList 呼叫 getMoviesByPage(裡面要丟的是event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


// 當你製作完paginator搜尋功能怪怪的?
// 搜尋keyword跳出相關電影，當你按下分頁又會跳回原本80部電影的第一頁，而不是搜尋結果的第一頁!
// 下方filterMovie是放在searchForm.addEvent...函式裡， 當這個函式結束後 就存取不到filterMovie 解決:把let filteredMovies = [] 放在上方第7行 const movies = [] 的下面




// [設置搜尋表單的事件監聽器]
// 綁定html事件元素是form， html李的form 有一個事件叫submit ex: 表單提交出去 那剎那的事件, 我們要抓的那剎那的事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 先用console.log(event)看看 當點擊search按鈕 devtool > console 可看到一瞬間出現的submit event 馬上被洗掉? why? 當瀏覽器提交表單會重整頁面
  // BUT javascript 不需要去重整頁面(剛剛的資料會不見) 只需把電影清單重新render就好

  // 下指令 | preventDefault:請瀏覽器不要做預設重整頁面的動作，                        *把控制權交給javascript去做* 用上面console.log(event) 查看devtool 可正常顯示submit event
  event.preventDefault()

  // 如何得到 SearchInput 裡輸入的文字? input: > value 會回傳目前input裡面儲存的值     console.log(searchInput.value)
  // 給keyword一個變數 | toLowerCase: 變小寫，這樣搜尋時不管大小寫都能搜到!             優化 + .trim 把搜尋時前或後的空白去掉
  const keyword = searchInput.value.trim().toLowerCase()

  // filterMovie的變數 存放搜尋完的結果
  // let filteredMovies = []

  // 當輸入空字串，跳出alert, 先註解掉因為當沒有輸入任何關鍵字式需要顯示全部的電影
  // if (!keyword.length) {
  //   return alert('please enter a valid words')
  // }

  // 比較常用 ex: map, filter, reduce
  // method 1: 用filter(陣列用的方法，把movies裡的每個元素丟到filter()條件函式裡檢查,有符合條件元素才會被保留，沒有元素就會被丟掉) 不用迴圈 
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword)

  )

  // 另外一個情況: 如果輸入jkls;fhjkklsa毫無關鍵字，沒有顯示全部電影 頁面變空
  if (filteredMovies.length === 0) {
    return alert('cannot find movies', keyword)
  }

  // 如何做搜尋?
  // method 2: for迴圈 | (includes: 搜尋的keyword有在tilte裡 如沒有回傳false) 如title有包含關鍵字就在filterMovies推進
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  
  // 共render3次之三: 搜尋時
  // // 按下search按鈕後 paginator 必須要要在render一次，除了要把movieList 重新render一次 paginator 也要
  renderPaginator(filteredMovies.length)
  // getMoviesByPage 就是資料一定要做分頁
  renderMovieList(getMoviesByPage(1))
})



// 共render3次之一: 網頁載入呼叫下方 (render)
axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    // array (80) data > API 回傳的資料, results > 放個電影清單資料
    // 方法一: for迴圈 每個movie推進movie陣列裡
    // for (const movie of response.data.results) {
    //   movies.push(movie)   
    // }
    // 先用console.log(response.data.results)看看
    // 方法二: 展開運算的方法 response前面加點
    movies.push(...response.data.results)
    // *函式Array.push 可接收N個參數 用逗點隔開
    // ex:展開運算把陣列拆開, 變成獨立資料 > 
    // (一個陣列 const numbers =[1, 2, 3] > movie.push(1, 2, 3))

    // 呼叫 movies.長度
    renderPaginator(movies.length)

    // 呼叫renderMovieList 在還沒製作分頁器前是丟整個movie(80部)陣列 > renderMovieList(movies)
    // 有分頁器後: 用getMoviesByPage 第一次呼叫這段程式碼 axios .get...render.. 定會顯示第一頁
    // so 把page1 丟進去 (1)
    renderMovieList(getMoviesByPage(1))
  })

// setItem會傳入兩個參數: 1. key 2.value localStorage 都會有一個key對應一個value    ex: localStorage.setItem('defualt_language', 'english') 這筆資料在devtool裡會存在 Application 裡的localStorage
// localStorage小缺點: 2.value !只能放string 字串! 如果小放物件或陣列 how? 轉成json的字串: 用JSON.stringify(函式) 再用JSON.parse把字串轉回javascript的資料 ex: object, array

localStorage.setItem('default_language', 'english')


// 在devtool>console裡可以看到english, 隨然把上面setItem 註解掉但因上個步驟已把setItem資料存入因此可被取出資料
// console.log(localStorage.getItem('default_language', 'english'))

// next 移除資料: 直接把key:default_language 刪掉
// localStorage.removeItem('default_language')

// 刪掉後再去取出資料 devtool > console就會變null 因default_language資料已不存在localStorage裡
// console.log(localStorage.getItem('default_language'))