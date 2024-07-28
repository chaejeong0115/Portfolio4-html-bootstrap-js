window.onload = function () {
    // navbar 동작
    var navbar버튼 = document.querySelectorAll('.nav-link')
    var main박스 = document.querySelectorAll('.tab_content')

    document.querySelector('.navbar-nav').addEventListener('click', function (e) {
        navbar동작(e.target.dataset.num);
    })

    function navbar동작(num) {
        for (let j = 0; j < navbar버튼.length; j++) {
            navbar버튼[j].classList.remove('active');
            main박스[j].classList.remove('show');
        }
        navbar버튼[num].classList.add('active');
        main박스[num].classList.add('show');
    }

    // home



    // store
    fetch("./store.json")
        .then(res => res.json())
        .then(productsList => {
            var products_data = productsList.products;

            renderProducts(products_data);

            search(products_data)

        })
        .catch(error => console.error('Error fetching the data:', error));

    // 카드 생성
    function renderProducts(products, searchtext = '') {
        var cardrow = document.querySelector('.store_card_row');
        cardrow.innerHTML = '';
        products.forEach(function (a) {
            var title = search_text(a.title, searchtext)
            var brand = search_text(a.brand, searchtext)
            var store_card = `<div data-id="${a.id}" draggable="true" class="col-sm-4 py-3 px-3 card store_card" style="background-color: white;">
                            <img src="./img/` + a.photo + `" class="w-100">
                            <h5 class="my-1 title">` + title + `</h5>
                            <p class="my-1" style="color: rgb(166, 166, 166);">` + brand + `</p>
                            <p class="my-2 price"> 가격 : ` + a.price + `원</p>
                            <button class="btn btn-dark px-2 pb-1 buy">Buy</button>
                        </div>`;
            cardrow.insertAdjacentHTML('beforeend', store_card);
        });

        // 드래그 시 선택한 title 출력
        var store_cards = document.querySelectorAll('.store_card');
        store_cards.forEach(function (card) {
            card.addEventListener('dragstart', function (e) {
                var id = card.getAttribute('data-id'); // 카드의 data-id 속성 값을 가져옴
                var title = card.querySelector('.title').innerText;
                e.dataTransfer.setData('text/plain', id); // 드래그 데이터에 id 값을 저장
                console.log(title + '을(를) 선택하셨습니다!')
            });
        });

        // 구매 버튼 누르면
        var buyBtn = document.querySelectorAll('.buy');
        buyBtn.forEach(function (button) {
            button.addEventListener('click', function () {
                var store_card = button.closest('.store_card'); // 클릭한 버튼이 속한 카드 요소 찾기
                var id = store_card.getAttribute('data-id'); // 카드의 data-id 속성 값을 가져옴
                addToCart(id);
            });
        });

    }


    // 검색 기능
    function search_text(text, searchtext) {
        if (!searchtext) return text;
        var regex = new RegExp(`(${searchtext})`, 'gi');
        return text.replace(regex, `<strong>$1</strong>`);
    }

    function search(products) {
        document.querySelector('.search_btn').addEventListener('click', function (event) {
            event.preventDefault();  // 폼의 기본 제출 동작을 막습니다.
            var searchtitle = document.querySelector('.search_input').value;
            console.log(searchtitle);
            var filterProducts = products.filter(function (product) {
                return product.title.includes(searchtitle) || product.brand.includes(searchtitle);
            });
            renderProducts(filterProducts, searchtitle)
        });

    }


    // 장바구니 드롭 영역 설정
    var cartbox = document.querySelector('.cartList');
    cartbox.addEventListener('dragover', function (e) {
        e.preventDefault();
    });
    cartbox.addEventListener('drop', function (e) {
        e.preventDefault();
        var id = e.dataTransfer.getData('text/plain'); // 드래그된 데이터에서 id 값을 가져옴
        addToCart(id);
    });


    // 장바구니에 아이템 추가
    function addToCart(id) {
        var cartbox = document.querySelector('.cartList');
        var existingItem = document.querySelector(`.cart-item[data-id="${id}"]`); // 해당 id 값을 가진 카드 요소를 찾음
        var count = 1;
        if (existingItem) {
            var countElement = existingItem.querySelector('.count');
            var quantity = parseInt(countElement.innerText.split(': ')[1]) + 1;
            countElement.innerHTML = `Count : ${quantity}`;
        }
        else {
            var store_card = document.querySelector(`.store_card[data-id="${id}"]`);
            if (store_card) {
                var clonedCard = store_card.cloneNode(true);
                clonedCard.classList.add('cart-item');
                clonedCard.querySelector('.buy').outerHTML = `<p class="count">Count : ${count}</p>
                                                              <div class="btn_cover">
                                                                  <button class="btn btn-sm btn-success add-btn">+</button>
                                                                  <button class="btn btn-sm btn-danger sub-btn">-</button>
                                                                  <button class="btn btn-sm btn-dark remove-btn">X</button
                                                              </div>`;
                cartbox.appendChild(clonedCard);
            }
        }
        updateButtonListeners();
        TotalPrice();
    }


    // 수량 증가/감소/삭제 버튼
    function updateButtonListeners() {
        var addBtn = document.querySelectorAll('.add-btn');
        addBtn.forEach(function (btn) {
            btn.removeEventListener('click', handleAdd); // 중복으로 증가되는 버그 방지
            btn.addEventListener('click', handleAdd);
        });

        var subBtn = document.querySelectorAll('.sub-btn');
        subBtn.forEach(function (btn) {
            btn.removeEventListener('click', handleSub);
            btn.addEventListener('click', handleSub);
        });

        var removebtn = document.querySelectorAll('.remove-btn');
        removebtn.forEach(function (btn) {
            btn.removeEventListener('click', handleRemove);
            btn.addEventListener('click', handleRemove);
        });
    }

    function handleAdd() {
        var cartItem = this.closest('.cart-item');
        var countElement = cartItem.querySelector('.count');
        var quantity = parseInt(countElement.innerText.split(': ')[1]) + 1;
        countElement.innerHTML = `Count : ${quantity}`;
        TotalPrice();
    }

    function handleSub() {
        var cartItem = this.closest('.cart-item');
        var countElement = cartItem.querySelector('.count');
        var quantity = parseInt(countElement.innerText.split(': ')[1]) - 1;
        if (quantity <= 0) {
            cartItem.remove()
        } else {
            countElement.innerHTML = `Count : ${quantity}`;
        }
        TotalPrice();
    }

    function handleRemove() {
        var cartItem = this.closest('.cart-item');
        cartItem.remove();
        TotalPrice();
    }


    // total 가격 계산
    function TotalPrice() {
        var cartItems = document.querySelectorAll('.cart-item');
        var total = 0;
        cartItems.forEach(function (item) {
            let title = item.querySelector('.title').innerText;
            let priceString = item.querySelector('.price').innerText.split(': ')[1]; // (금액)원
            let price = parseInt(priceString.replace('원', ''));
            let count = parseInt(item.querySelector('.count').innerText.split(': ')[1]);
            console.log(`title : ${title}, price : ${price}, count : ${count}`);
            total += price * count;
        });
        document.querySelector('.total_Price').innerHTML = `Total : ${total.toLocaleString()}원`;
    };


    // Buy Now 버튼 누르면
    // order_sheet 나타내기
    let order_sheet = document.querySelector('.order_sheet');
    document.querySelector('.final_buy').addEventListener('click', function () {
        order_sheet.classList.add('sheet_show');
    });

    document.querySelector('.close_order').addEventListener('click', function () {
        order_sheet.classList.remove('sheet_show');
    });

    let receipt_sheet = document.querySelector('.receipt_sheet');

    // Complete 버튼 누르면
    let formData = {
        name: '',
        email: '',
        phoneNumber: '',
        orderDate: '',
        cartItems: []
    }

    document.querySelector('#order').addEventListener('submit', function (e) {
        e.preventDefault(); // 기본 제출 동작 방지..?

        let name = document.querySelector('#name').value;
        let email = document.querySelector('#email').value;
        let phoneNumber = document.querySelector('#phonenumber').value;

        // 입력된 값을 formData 객체에 저장
        formData.name = name;
        formData.email = email;
        formData.phoneNumber = phoneNumber;
        formData.orderDate = new Date().toLocaleString(); // 현재 날짜와 시간 저장

        // 장바구나 항복 저장
        formData.cartItems = [];
        document.querySelectorAll('.cart-item').forEach(function (item) {
            let title = item.querySelector('.title').innerText;
            let brand = item.querySelector('p').innerText;
            let priceString = item.querySelector('.price').innerText.split(': ')[1];
            let price = parseInt(priceString.replace('원', ''));
            let count = parseInt(item.querySelector('.count').innerText.split(': ')[1]);
            formData.cartItems.push({
                title: title,
                brand: brand,
                price: price,
                count: count
            });
        });


        if (name === '' || email === '' || phoneNumber === '') {
            alert('Please enter all of them!');
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert(`${email} is not email format!`);
        }
        else if (!(/^[0-9]*$/.test(phoneNumber)) || phoneNumber.length !== 11) {
            alert(`${phoneNumber} is not phone number format!`);
        }
        else if (formData.cartItems.length === 0) {
            alert('There are no products contained in the shopping cart.')
        }
        else {
            order_sheet.classList.remove('sheet_show');
            receipt_sheet.classList.add('sheet_show');

            Receipt(formData);
        };
    });

    function Receipt(data) {
        var canvas_receipt = document.getElementById('canvas_receipt');
        var c_r = canvas_receipt.getContext('2d');

        // 캔버스 크기를 동적으로 조정
        var totalHeight = 150 + (data.cartItems.length * 90); // 기본 높이 + 아이템별 높이
        canvas_receipt.height = totalHeight;

        c_r.clearRect(0, 0, canvas_receipt.width, canvas_receipt.height); // 이전 내용 지우기
        c_r.font = '11px dotum';
        c_r.fillText(`Order Date : ` + data.orderDate, 0, 10);
        c_r.fillText(`Orderer : ` + data.name, 0, 40);
        c_r.fillText(`E-mail : ` + data.email, 0, 55);
        c_r.fillText(`Phone Number : ` + data.phoneNumber, 0, 70);

        let startY = 100;
        let total = 0;
        data.cartItems.forEach(function (item) {
            c_r.fillText(`Title: ${item.title}`, 0, startY);
            c_r.fillText(`Brand: ${item.brand}`, 0, startY + 15);
            c_r.fillText(`Price: ${item.price.toLocaleString()}원`, 0, startY + 30);
            c_r.fillText(`Count: ${item.count}`, 0, startY + 45);
            c_r.fillText(`Subtotal: ${(item.price * item.count).toLocaleString()}원`, 0, startY + 60);
            total += item.price * item.count;
            startY += 90; // 항목 간 간격
            console.log(`${item.title} / ${item.brand} / ${item.price.toLocaleString()}원 / ${item.count} / ${(item.price * item.count).toLocaleString()}원`)
        });
        c_r.font = 'bold 16px dotum';
        c_r.fillText(`Total: ${total.toLocaleString()}원`, 0, startY + 15);
        console.log(`Total: ${total.toLocaleString()}원`)
    }



    document.querySelector('.close_receipt').addEventListener('click', function () {
        receipt_sheet.classList.remove('sheet_show');
        document.querySelector('.cartList').innerHTML = ''
        cartItems = [];
        document.querySelector('.total_Price').innerHTML = 'Total : 0원';
    });
}