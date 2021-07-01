// 環境建立  1.調整js結構   2.API配置確認
// 前台開發

// ▼ 1.產品 get/篩選 資料 ▼
const productList = document.querySelector('.productWrap');
const cartlist = document.querySelector(".shoppingCart-tableList");
let productData = [];
let cartData = [];

//初始化
function init() {
    getProductList();
    getCartList();
};
init();
//串接外部產品API
function getProductList() {
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
        .then(function (response) {
            // 成功會回傳的內容
            productData = response.data.products;
            renderProductList(); //步驟1-1
        })
        .catch(function (error) {
            // 失敗會回傳的內容
            console.log("串接失敗");
        })
};

//步驟1-3：簡化重複使用的程式(可視使用次數情況寫或不寫)
function simplifyProductHTMLItem(item) {
    return `
    <li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>
    `
};
//步驟1-1：遍歷API資料，並放入指定清單
function renderProductList() {
    let str = "";
    productData.forEach(function (item) {
        str += simplifyProductHTMLItem(item);
    });
    productList.innerHTML = str;
};

// 步驟1-2：下拉選單篩選功能
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", function (e) {
    const category = e.target.value;
    if (category === "全部") {
        renderProductList();
        return;
    };
    let str = "";
    productData.forEach(function (item) {
        if (item.category == category) {
            str += simplifyProductHTMLItem(item);
        };
    });
    productList.innerHTML = str;
});


// ▼▼ 2.購物車 API 設計 ▼▼
// 步驟2-1：「產品清單」限定事件選取範圍
productList.addEventListener("click", function (e) {
    e.preventDefault();  // 取消<a>連結的預設動作
    // 只在「加入購物車」的按鈕上才有作用
    let addCartClass = e.target.getAttribute("class");
    if (addCartClass !== "js-addCart") {
        return;
    };
    //步驟2-3：將購買數量新增至後端API中
    let productId = e.target.getAttribute("data-id");
    let numCheck = 1;
    cartData.forEach(function (item) {
        if (item.product.id === productId) {
            numCheck = item.quantity += 1;
        };
    });

    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    }).then(function (response) {
        alert("加入購物車!");
        getCartList();
    });
});

//步驟2-2：「我的購物車」串接後台API
function getCartList() {
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
            // 成功會回傳的內容
            cartData = response.data.carts;
            let str = "";
            cartData.forEach(function (item) {
                str += `<tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${toThousands(item.product.price)}</td>
                <td>${item.quantity}</td>
                <td>NT$${toThousands(item.product.price * item.quantity)}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-id="${item.id}">
                        clear
                    </a>
                </td>
            </tr>`
            });
            cartlist.innerHTML = str;
            //步驟2-4：顯示購物車中總金額
            console.log(response.data.finalTotal)
            document.querySelector(".js-total").textContent = toThousands(response.data.finalTotal);
        })
};

//步驟2-5：刪除購物車清單
cartlist.addEventListener("click", function (e) {
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    if (cartId == null) {
        return;
    }
    //刪除已新增的API資料
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then(function (response) {
            // 成功會回傳的內容
            getCartList();
            alert("刪除成功")
        })
});

//步驟2-6：刪除所有品項
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
    e.preventDefault();
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
            alert("資料已全部清空")
            getCartList();
        })
        //當已全部清空資料後，在點擊「全部清除」會在console顯示Error:400，此時可追加一個錯誤判斷的提示
        .catch(function (response) {
            alert("購物車已清空，請勿重複點擊")
        })
});



// ▼▼▼ 3.產生訂單API ▼▼▼
//步驟3-1：送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
    e.preventDefault();
    //步驟3-2：確認購物車是否有值
    if (cartData.length == 0) {
        alert('購物車為空白，請選擇產品')
        return;
    };

    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const customertradeWay = document.querySelector("#tradeWay").value;
    //步驟3-3：確認表單是否為空白
    if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customertradeWay == "") {
        alert("欄位不可為空白")
        return;
    };
    if(validateEmail(customerEmail)==false){
        alert("請填寫正確的email格式");
        return;
    };

    //步驟3-4：串接後台API
    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
                "name": customerName,
                "tel": customerPhone,
                "email": customerEmail,
                "address": customerAddress,
                "payment": customertradeWay
            }
        }
    }).then(function (response) {
        alert("訂單已傳輸成功!")
        getCartList();

        //步驟3-5：將送出資料後的表單還原初始狀態
        document.querySelector("#customerName").value = "";
        document.querySelector("#customerPhone").value = "";
        document.querySelector("#customerEmail").value = "";
        document.querySelector("#tradeWay").value = "";
        document.querySelector("#customerAddress").value = "";
    })
});


//unti js(工具性質)
//千分位
function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};

//確認mail表單欄位是否正確
function validateEmail(mail) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
        return ture;
    }
    // alert("你的email格式錯誤")
    return false;
};