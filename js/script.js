window.onload = function () {

    //Si apreamos el carrito de la compra se añade la clase active , si la tiene la quita, para hacer aparecer y desaparecer el carro
    document.querySelector(".cesta").addEventListener("click", () => {
        document.querySelector(".carro").classList.toggle("active");
    })

    //Si apretamos cualquiera de las categorias de la parte superior de la pagina filtra por esa categoría
    var filtros = document.querySelectorAll(".tipos_foto");
    for (const fil of filtros) {
        fil.addEventListener("click", filtra);
    }

    //Si hacemos click en el banner del principiod e pagina recarga la pagina
    document.querySelector(".cabecera").addEventListener("click", () => {
        location.reload();
    });
    //A todo el contenedor principal le añadimos el evento dependiendo de lo q pulsaste hace una cosa u otra
    document.querySelector(".wrapper").addEventListener("click", funciones);

    //Si hacemos clikc en la lupa delñ buscador o apretamos el enter  fultra por lo que hayas escrito en el buscador
    document.querySelector(".fa-magnifying-glass").addEventListener("click", filtra);
    document.querySelector(".buscador").addEventListener("keydown", filtra);

    //Al carro le añadimos evento a todo el carrro depende de lo que pulsemos hace una cosa u otra
    document.querySelector(".carro").addEventListener("click", funcionesCarro);
    //Si apretamos el enter en el carro significa que hemos intentado introducir un cupón de descuento
    document.querySelector(".carro").addEventListener("keydown", funcionesCarro);

    //Creamos 2 mapas, uno para todos los productos que extraigamos del json y otro para los productos que vamos añadiendo al carro de la compra
    var productos = new Map();
    var mapacarro = new Map();

    //Añadimos 1 campo de serie al mapa del carro que es cupon valor 1
    //Esto lo que hace es multiplicar el valor total del carro  *1 cosa que no hace nada , pero si introducimos cupon , este valor cambia
    //Por 0.92 por ejemplo si hacemos el descuento del 8%, entonces ya se aplica directamente
    mapacarro.set("cupon", 1);

    //Extraemos los datos del json con await fecth
    //Y los añadimos al mapa de productos

    (async function data() {
        const datos = await fetch("js/catalogo.json");
        const catalogo = await datos.json();
        for (const item of catalogo) {
            productos.set(item.nombre, item);
        }
        return showView();
    })();

    //Funcion filtra por categoria o buscador
    function filtra(e) {
        var filter = new Map();

        //Si pulsaste enter o la lupa filtra por lo que hayas escrito
        if (e.keyCode == 13 || this.tagName == "I") {
            for (const [k, v] of productos) {
                //transformamos cada objeto a texto y si incluye lo que hayamos escrito filtra
                let texto = Object.values(v).join("");
                if (texto.toUpperCase().includes(document.querySelector("#buscador").value.toUpperCase())) {
                    filter.set(k, v);
                }
            }
            //Si es 0 muestra mensaje sin resultados
            if (filter.size == 0) {
                document.querySelector("h1").textContent = "No se han encontrado resultados"
                document.querySelector(".wrapper").innerHTML = "";
                return false;
            }
            document.querySelector("h1").textContent = "Resultados de " + document.querySelector("#buscador").value.toUpperCase();
            document.querySelector("#buscador").value = "";
            showView(filter);
        }
        //Si no pulsaste tecla  ni la lupa coge la categoria del elemento qu pulsaste y filtra
        if (e.keyCode == undefined && this.tagName != "I") {
            for (const [k, v] of productos) {
                if (v.categoria == this.dataset.nom) {
                    filter.set(k, v);
                }
            }
            document.querySelector("h1").textContent = this.dataset.nom.toUpperCase();
            showView(filter);
        }
    }

    //Pintamos el catalogo
    function showView(filtro) {
        //Vaciamos el catalogo y pintamos
        document.querySelector(".wrapper").innerHTML = "";

        //Si no le pasamos nignun parametro a la funcion pinta todos los productos , y sino el mapa filtrado
        filtro == undefined ? filtro = productos : filtro = filtro;

        //Iteramos el mapa de productos
        for (const [k, item] of filtro) {
            //Reiniciamos todas las variables
            let desc = "";
            let desc2 = "";
            let precioanterior = "";
            let imgreg = "";
            let romboreg = "";

            //Si tiene regalo , añadimos estas 3 variables, el regalo, la imagend el recalo y un banner regalo incluido
            if (item.regalo != "") {
                reg = `De regalo ${item.regalo}`;
                imgreg = `<img class='regalo' src='Images/${item.regalo}.png'>`;
                romboreg = `<div class="paralelogramo">Regalo Incluido</div>`;
            }
            //Si tiene descuento , añadimos estas 3 variables, la clase descuento, el porcentaje informativo de descuento, y el cálculo de lo
            //que valia antes el producto con esta formula
            if (item.descuento != "") {
                desc = "descuento";
                desc2 = `-${item.descuento}%`;
                precioanterior = "<p class='anterior'>P.V.P:<span class='anterior anterior-precio'>" + (parseFloat(item.precio.replace(",", ".")) / (1 - (item.descuento / 100))).toFixed(2).replace(".", ",") + "€</span></p>";
            }

            //Y pintamos, si las variables anteriores estan vacias porque no tiene regalo o no tiene descuento
            //no las pinta
            document.querySelector(".wrapper").innerHTML += `
            <div class="item">
                <div class="item_imagen">
                    <img class="item_img" src="Images/Palas/${item.foto}">
                    <div class="${desc}">${desc2}</div>
                        ${imgreg}
                </div>
                 <h2>${item.nombre.toUpperCase()}</h2>
                <span>${item.descripcion}</span>
                ${precioanterior}
                <p class="precio">${item.precio}€  </p>
                ${romboreg}
                <span>ULTIMAS <strong> ${item.unidades}</strong> uds.</span>
                <div class="mensaje"><i class="fa-solid fa-basket-shopping"></i></div>
                <button class="${item.nombre}">Añadir a la cesta</button>
            </div>
             `;
            //Si las unidades del producto son 0, desactivamos el boton, pintamos todo el contenedor de gris quitamos el precio, regalos y 
            //descuentos y añadimos el texto producto agotado al boton

            if (item.unidades == 0) {
                document.getElementsByClassName(item.nombre)[0].previousElementSibling.previousElementSibling.innerHTML = "";
                document.getElementsByClassName(item.nombre)[0].parentElement.classList.toggle("grises");
                document.getElementsByClassName(item.nombre)[0].textContent = "Producto Agotado";
                document.getElementsByClassName(item.nombre)[0].disabled = true;
            }
        }
    }

    //Funcion para comprar
    function compra(e) {
        //Se puede acceder de 2 maneras a esta funcion, clickando en comprar y dandole al boton'+' en el carro ya teniendo otro producto previamente
        //entonces si apreto el + ya le mando el valor en la variable e, pero si apreto en comprar, tengo que coger el target que aprete y sacar el valor
        //de ahí. Enntonces digo que si existe target coja ese valor, sino es que ya le mande el valor.
        e.target ? e = e.target.className : e = e;

        //Saco el producto del mapa y la referencia en el dom, pero si estoy en una categoria que no muestre ese producto, lo compruebo y no lo pinto
        let prodactu = productos.get(e);
        let referencia = document.getElementsByClassName(e)[0];
        //Si las unidades son menores que 5, pinta el texto en rojo
        if (prodactu.unidades <= 5 && referencia != undefined) {
            referencia.previousElementSibling.previousElementSibling.firstElementChild.style.color = "red";
        }
        //si las unidades son 1 desactiva el boton porque compro la ultima
        if (prodactu.unidades == 1) {
            prodactu.unidades = productos.get(e).unidades - 1;
            productos.set(e, prodactu);

            //Si estoy en la vista que tenga el producto actualiza datos
            if (referencia != undefined) {
                referencia.previousElementSibling.previousElementSibling.innerHTML = ""; //`<img src="Images/agotado.png">`;
                referencia.parentElement.classList.toggle("grises");
                referencia.disabled = true;
                referencia.textContent = "Producto Agotado";

            }
            //Si nos e cumple nada de eso simplemente resto 1 a unidades del mapa de productos para llevar la cuenta
        } else {
            prodactu.unidades = productos.get(e).unidades - 1;
            productos.set(e, prodactu);
            //Si no estoy en la vista que tenga el producto no actualiza datos
            if (referencia != undefined) {
                referencia.previousElementSibling.previousElementSibling.firstElementChild.textContent = prodactu.unidades;
            }

        }
        //Y añado 1 al mapa del carrito con ese nombre

        !mapacarro.has(prodactu) ? mapacarro.set(prodactu, 1) : mapacarro.set(prodactu, mapacarro.get(prodactu) + 1);

        //LLamo a la funcion pintaCarro que me actualiza el carrito de la compra
        pintaCarro();
    }

    function muestra(e) {

        //Si apreté el boton de compra, muestra una pequeña animacion como que se añadió correctamente al carro arriba  la derecha
        //de cada producto que se desvanece en 1,5 segundo o se desvanece si volvemos a apretar en compra lo cual reinicia la animacion
        if (e.target.tagName == "BUTTON") {
            if (e.target.previousElementSibling.className == "mostrar") {
                e.target.previousElementSibling.classList.remove("mostrar");
            }
            e.target.previousElementSibling.classList.add("mostrar");
            // Desvanecer el mensaje 
            setTimeout(() => {
                if (e.target.previousElementSibling != null) {
                    e.target.previousElementSibling.classList.remove("mostrar");
                }
            }, 1500);


        } else {
            //Sino he apretado boton, significa que he apretado en la foto del producto por lo cual la hago mas grande en una entana superpuesta
            let url = e.target.src;
            var tapa = document.getElementById("tapa");
            tapa.innerHTML = `<figure id="imgGrande"><figcaption>${e.target.parentElement.nextElementSibling.textContent}<i class="fa-solid fa-circle-xmark"></i></figcaption><img src=" ${url}" ></figure>`;

            tapa.style.display = "flex";

            //añado un settimeout para que haga efecto de opacidad despues del display none
            setTimeout(() => {
                tapa.firstElementChild.style.opacity = 1;
            }, 100);

            //Añado un elemento X para cerrar la ventana
            document.querySelector(".fa-circle-xmark").addEventListener("click", () => {
                document.getElementById("tapa").style.display = "none";
            });
        }
    }

    //Funcion que distribuye las acciones en funcion de lo que haya clickado
    function funciones(e) {
        //Si clicko en cualquier parte con el carrito abierto, lo cierra
        if (document.querySelector(".carro").classList.contains("active"))
            document.querySelector(".carro").classList.remove("active");


        //Si clicko en algun boton de compra, actualizo la vista y llamo a la funcion compra
        if (e.target.tagName == "BUTTON") {
            muestra(e);
            compra(e);
        }
        //Si clicko en alguna imagen, voy a la funcion muestra y la hago grande
        if (e.target.className ==
            "item_img") {
            muestra(e);
        }
    }

    //Manejsador de las funciones del carrito
    function funcionesCarro(e) {
        //Si presiono enter, comprueblo el cupon introducido en el input
        if (e.keyCode == 13) {
            compruebaCupon();
        }
        //Si presiono algun boton (puede ser '-' o '+' voy a la funcion botones carro)
        if (e.target.tagName == "BUTTON") {
            botonesCarro(e);
        }
    }

    //Funcion para actualizar el carrito de la compra
    function pintaCarro() {
        let carro = document.querySelector(".carro_productos");
        let carrototal = document.querySelector(".carro_calculo");

        //Cojo la cantidad de articulos diferentes de la longitud del mapa del carrito( entiendo que si tengo 5 de un tipo no quuiero que me diga
        // que tengo 5 productos, sino 1 pero de eses tengo 5 unidades) , me contaría productos diferentes, cantidades de cada uno a parte
        document.querySelector("#cantidad").textContent = mapacarro.size - 1;

        //Si el size del mapa carrito es 1 significa que esta vacío porque tiene la clave cupon , como predeterminada en 1
        if (mapacarro.size == 1) {
            carro.innerHTML = "";
            carrototal.innerText = "Carrito Vacío";
            return false;
        }
        //Reiniciamos la variable total para vovler a calcular el total de los productos y el div del carrito
        let total = 0;
        carro.innerHTML = "";

        //Recorremos el mapa del carrito, en este caso la klave es el objeto entero y el valor las unidades de cada uno
        for (const [k, v] of mapacarro) {
            //No caonsideramos la clave cupon predeterminada al recorrer los productos del carrito
            if (k != "cupon") {
                let sumaprecio = (parseFloat(k.precio.replace(",", ".")) * v).toFixed(2);
                let coniva = (parseFloat(sumaprecio) + (sumaprecio * k.iva / 100)).toFixed(2);
                let div = document.createElement("div");
                div.id = k.nombre;
                div.innerHTML = `<div> <img class="${k.categoria}" src="Images/Palas/${k.foto}"></div>`;
                let div3 = document.createElement("div");
                div3.innerHTML = `<h2>${k.nombre}</h2>`;
                let span1 = document.createElement("span");

                //Si el mapa principal de productos tiene las unidades a 0, el boton '+' del carrito esta desactivado porque no podria añadir mas
                productos.get(k.nombre).unidades == 0 ? span1.innerHTML = `<button>-</button>${v}<button disabled="true" title="Fuera de Stock">+</button>` : span1.innerHTML = `<button>-</button>${v}<button>+</button>`;

                div3.appendChild(span1);
                div3.innerHTML += `<span> P.V.P : ${sumaprecio.replace(".", ",")} €</span>
                    <span>IVA:${k.iva}% </span>
                    <span>${coniva.replace(".", ",")} €</span>`;
                div.appendChild(div3);
                carro.appendChild(div);
                total = total + parseFloat(coniva);
            }

        }

        //De forma predeterminada creamos el total con un input para poder introducir el codigo de descuento y calculamos el total de la factura
        carrototal.innerHTML = ` 
        <div >SubTotal: 
        ${total.toFixed(2).replace(".", ",")}   €</div>
        <div><input id="inputcupon" type="text" placeholder="Código Descuento " ><span id="novalido">OUT8: 8% descuento</span></div>
        
        <div id="totalcompra">Total: 
        ${total.toFixed(2).replace(".", ",")}   €</div>
        <a id="factura" rel="opener" href="factura.html" target="_blank">GENERAR FACTURA <i class="fa-solid fa-file-invoice"></i></a>
        `
        //rel="opener" hace que no se pierda el sesion storage al cambiar de ventan con el parametro blank
        sessionStorage.setItem("productos", JSON.stringify(Array.from(mapacarro)));
        ;

        //Si ya hemos anteriormente introducido un codigo de descuento el valor del mapa será distinto de 1 entonces pintamos el total de otra manera
        if (mapacarro.get("cupon") != 1) {

            //Borramos el input de introducit el cupon
            document.querySelector("#inputcupon").remove();

            //Al elemento span no valido que estaba en display none lo pasamos a blok para mostrar mensaje que el cupon es correcto
            //(se llama no valido porque en principio estaba pensado para cuando fallaras el cupon, pero al final lo trate de otra manera 
            //igualmente le quedo el nombre del id)
            document.getElementById("novalido").style.display = "block";

            //Ahora el total es igual al total *el cupon 
            total = total * mapacarro.get("cupon");
            document.getElementById("totalcompra").textContent = `Total : ${total.toFixed(2).replace(".", ",")}   €`;
        }
    }

    //Funcion que salta cuando introduzco en el input texto del cupón
    function compruebaCupon() {

        //Si este valor es OUT8 el valor de la clave cupon , del mapa carrito vale 0.92 (para multiplicar a la hora de calcular el total
        //esto sería un 8%)
        if (document.querySelector("#inputcupon").value == "OUT8") {
            mapacarro.set("cupon", 0.92);
            pintaCarro();

            //Si el kcodigo es incorrecto, valiamos el valor introducido y e el placeholde del input añadimos mensaje de cupon no valido
        } else {
            document.querySelector("#inputcupon").value = "";
            document.querySelector("#inputcupon").placeholder = "Cupón No Valido";
        }
    }

    //Funcion que trata los botones + y - del carrito
    function botonesCarro(e) {
        let clave = e.target.parentElement.parentElement.parentElement.id;

        //Si es +, simplemente llamo a la funcion compra porque hace lo mismo y le paso de clave del mapa productos el id del elemento padre que sería el nombre del producto 
        if (e.target.textContent == "+") {
            compra(clave);
        } else {

            //Si es '-' al mapa del carrito le añado 1 a las unidades y al mapa de los productos le resto 1 a las unidades
            let actu = productos.get(clave);
            actu.unidades = actu.unidades + 1;
            productos.set(clave, actu);
            mapacarro.set(productos.get(clave), mapacarro.get(productos.get(clave)) - 1);

            //Si se actualizan las unidades a 1 del mapa principal se vuelve a pintar el boton de compra, pero si estoy en una vista que no tenga ese articulo no hace nada, al volver a cargar su vista se actualizara solo
            if (productos.get(clave).unidades == 1 && document.getElementsByClassName(clave).length != 0) {
                //Al borrar parte del div cuando hubieran lelgado a 0 lo vuelvo a pintar al estar en 1 otra vez
                document.getElementsByClassName(clave)[0].previousElementSibling.previousElementSibling.innerHTML = `ULTIMAS <strong> ${productos.get(clave).unidades}</strong> uds.`;
                document.getElementsByClassName(clave)[0].parentElement.classList.toggle("grises");
                document.getElementsByClassName(clave)[0].textContent = "Añadir a la cesta";
                document.getElementsByClassName(clave)[0].disabled = false;

            }
            //Si las unidades son distintas de 0 pinto las unidades

            if (document.getElementsByClassName(clave).length != 0) {
                document.getElementsByClassName(clave)[0].previousElementSibling.previousElementSibling.firstElementChild.textContent = actu.unidades;
            }
            //Si llegan las unidades a 0, borro del mapa del carrito el producto
            if (mapacarro.get(productos.get(clave)) == 0) {
                mapacarro.delete(productos.get(clave));
            }
            //Y vuelvo a pintar el carrito
            pintaCarro();
        }
    }
}