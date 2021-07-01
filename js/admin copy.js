// 請代入自己的網址路徑
const api_path = "gonsakon333";
const token = "SSV7nxBIbgc9s1dDwah09Sk6KwM2";
// DOM
const orderList = document.querySelector(".orderList");
const deleteAllOrderBtn = document.querySelector('.deleteAllOrderBtn');
let orderData = []

// 資料初始化
function init(){
  getOrderList()
}
init();

// 取得訂單列表
function getOrderList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token,

      }
    })
    .then(function (response) {

      orderData = response.data.orders;
      let str = '';
      orderData.forEach(function (item) {
        str += `<li>訂單編號：${item.id}，購買數量：${item.quantity}個 <input type="button" data-id="${item.id}" class="" value="刪除訂單"/></li>`
      })
      orderList.innerHTML = str;
      renderC3();
    })
}

// C3繪製
function renderC3(){
  // 物件資料蒐集
  let total={};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      if (total[productItem.category]== undefined){
        total[productItem.category] = productItem.price
      }else{
        total[productItem.category] += productItem.price
      }
    })
  })
  // 做出資料關聯
  let categoryAry = Object.keys(total);
  // 透過 total + categoryAry 組出 C3 格式
  let newData = [];
  categoryAry.forEach(function(item){
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  })
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      columns: newData, // 資料存放,
      type:"pie"
    }
  });
}

// 修改訂單狀態
function editOrderList(orderId) {
  axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": true
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
    })
}

// 刪除特定訂單
orderList.addEventListener("click", function (e) {
  let orderId = e.target.getAttribute('data-id');
  if (orderId == null) {
    return;
  }
  deleteOrderItem(orderId);
})
function deleteOrderItem(orderId) {
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      alert("刪除特定訂單成功")
      getOrderList();
    })
}

// 刪除全部訂單
function deleteAllOrder() {
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      alert("刪除全部訂單成功")
      getOrderList();
    })
}
deleteAllOrderBtn.addEventListener('click', function (e) {
  deleteAllOrder()
})


