async function getProducts (){
    let response = await fetch("store_db.json")
    let products = await response.json()
    return products
}

getProducts().then(function(products){
    let productsList = document.querySelector('.product-grid')
    if (productsList) { 
        products.forEach(function(product) {
            productsList.innerHTML += getCardHTML(product)
        })
    }
})

function getCardHTML(product) {
    return `<div class="product-card">
                    <img src="img/${product.image}" alt="SILVER POT SINGLEY">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <span class="price">$${product.price}</span>
                    <a href="#" class="btn">Add to Cart</a>
                </div>`
}
