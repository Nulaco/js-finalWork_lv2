let orderData = [];
const orderList = document.querySelector(".js-orderList");

// 初始化
function init() {
  getOrderList();
}
init();

// 功能五-ex：聯動圖表比例-另一方法
function renderC3_lv2() {
  // 步驟 5-1：物件資料蒐集
  let obj = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.category] === undefined) {
        obj[productItem.category] = productItem.price * productItem.quantity;
      } else {
        obj[productItem.category] += productItem.price * productItem.quantity;
      }
    })
  });

  // 步驟 5-2：拉資料關聯
  // 透過oranginAry，整理成C3格式
  let oranginAry = Object.keys(obj);
  let rankStoryAry = [];
  oranginAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankStoryAry.push(ary);
  });

  // 步驟 5-3：比大小，降冪排列(目的：取營收前三高的品項當主要色塊，把其餘的品項加總成統一色塊)
  rankStoryAry.sort(function(a,b){
    return b[1]-a[1];
  });
  // 步驟 5-4：若比數超過4筆以上，就統整為"其他"
  if(rankStoryAry.length >4){
    let orderTotal = 0;
    rankStoryAry.forEach(function(item,index){
      if(index>2){
        orderTotal += rankStoryAry[index][1];
      }
    })
    rankStoryAry.splice(3, rankStoryAry.length-1);
    rankStoryAry.push(["其他", otherTotal]);
  };

  // C3 js
  let chart = c3.generate({
    bindto: "#chart", //HTML 元素綁定
    data: {
      type: "pie",
      columns: rankStoryAry,
      color: {
        'Louvre 雙人床架': "#DACBFF",
        'Aotony 雙人床架': "#9D7FEA",
        'Anty 雙人床架': "#543A7",
        '其他': "#301E5F",
      }
    },
  });
};


// 功能一：讀取定單資料
function getOrderList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders
  `, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      //步驟 1-1：讀取遠端資料，並呈列
      orderData = response.data.orders;
      let str = '';
      orderData.forEach(function (item) {
        // 步驟 1-4：組時間字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()};`

        // 步驟 1-3：組產品字串 (若選擇多樣商品也需條列進表格)
        let productStr = "";
        item.products.forEach(function (productItem) {
          productStr += `<p>${productItem.title} x ${productItem.quantity} 件</p>`
        });

        // 步驟 1-4：判斷訂單處理狀態(從顯示 "false" → "未處理")
        let orderStatus = "";
        if (item.paid == true) {
          orderStatus = "已處理"
        } else {
          orderStatus = "未處理"
        };

        // 步驟 1-2：組訂單字串，用參數簡化顯示
        str += `<tr>
      <td>${item.id}</td>
      <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
        ${productStr}
      </td>
      <td>${orderTime}</td>
      <td class="js-orderStatus">
          <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
      </td>
      <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
      </td>
  </tr>`
      })
      orderList.innerHTML = str;
      renderC3_lv2();
    })
};

// 功能二：未處理與刪除訂單
// 步驟 2-1：點擊到「訂單狀態」、「刪除按鈕」
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  console.log(targetClass);
  let id = e.target.getAttribute("data-id");

  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    deleteOrderItem(id)
    return;
  };

  // 步驟 2-3：刪除選項
  if (targetClass == "orderStatus") {
    let status = e.target.getAttribute("data-status");
    changOrderStatus(status, id);
    return;
  };

});

// 步驟 2-2：更改訂單狀態
function changOrderStatus(status, id) {
  console.log(status, id);
  let newStatus;
  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true;
  };
  axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders
  `, {
    "data": {
      "id": id,
      "paid": newStatus
    }
  }, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      alert("修改訂單成功");
      getOrderList();
    })
};

// 功能三：刪除單筆訂單資料
function deleteOrderItem(id) {
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${id}
  `, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      alert("刪除此筆資料成功");
      getOrderList();
    })
};

// 功能四：刪除全部訂單資料
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders
  `, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      alert("刪除全部訂單成功");
      getOrderList();
    })
});


