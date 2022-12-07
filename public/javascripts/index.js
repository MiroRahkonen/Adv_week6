const recipecontainer = document.getElementById("showrecipe");
const categorycontainer = document.getElementById("categories");
const name_text = document.getElementById("name-text");
const ingredients_text = document.getElementById("ingredients-text");
const instructions_text = document.getElementById("instructions-text");
const ingredient_button = document.getElementById("add-ingredient");
const instruction_button = document.getElementById("add-instruction");
const images_input = document.getElementById("image-input");
const submit_button = document.getElementById("submit");
const searchrecipe_input = document.getElementById("searchrecipe");

let ingredients = [];
let instructions = [];

searchrecipe_input.addEventListener("keypress",async function(event){
    const recipename = searchrecipe_input.value
    if(event.key === "Enter"){
        event.preventDefault();
        if(recipename == ""){
            return;
        }
        recipecontainer.innerHTML = "";    
        
        /*Fetching recipe data*/
        response = await fetch(`/recipe/${recipename}`)
        recipedata = await response.json();
        console.log(recipedata)
        /*Recipe title*/
        const name = recipedata.name;
        const recipetitle = document.createElement("h2");
        recipetitle.innerHTML = name;

        const ingre_h3 = document.createElement("h3");
        ingre_h3.innerHTML = "Ingredients"
        const ingre_ul = document.createElement("ul");
        recipedata.ingredients.forEach((ingredient)=>{
            item = document.createElement("li");
            item.innerHTML = ingredient;
            ingre_ul.appendChild(item);
        })

        const instr_h3 = document.createElement("h3");
        instr_h3.innerHTML = "Instructions";
        const instr_ol = document.createElement("ol");
        recipedata.instructions.forEach((step)=>{
            const item = document.createElement("li");
            item.innerHTML = step;
            instr_ol.appendChild(item);
        })

        /*Fetching images from database based on IDs
        and adding them to the page*/ 
        const image_div = document.createElement("div");
        image_div.id = "images";
        image_div.innerHTML = "";
        
        recipedata.images.forEach(async (imageID)=>{
            response = await fetch(`/images/${imageID}`)
            let imagedata = await response.blob();
            
            let objectURL = URL.createObjectURL(imagedata);
            let imagecontainer = document.createElement("img")
            imagecontainer.src = objectURL;
            image_div.appendChild(imagecontainer);
        })

        /*Adding all the elements into the recipe container*/
        const newrecipecontainer = document.createElement("div")
        newrecipecontainer.appendChild(recipetitle);
        newrecipecontainer.appendChild(ingre_h3);
        newrecipecontainer.appendChild(ingre_ul);
        newrecipecontainer.appendChild(instr_h3);
        newrecipecontainer.appendChild(instr_ol);
        newrecipecontainer.appendChild(image_div);
        recipecontainer.appendChild(newrecipecontainer);
    }
})

ingredient_button.addEventListener("click",function(){
    ingredients.push(ingredients_text.value);
})

instruction_button.addEventListener("click",function(){
    instructions.push(instructions_text.value)
})

submit_button.addEventListener("click",async function(){
    let images = new FormData();
    let categories = [];

    for(let i=0;i<images_input.files.length;i++){
        images.append("images",images_input.files[i])
    }

    let response = await fetch("/images",{
        method: "post",
        body: images
    })
    let imagedata = await response.json();

    let checkboxes = document.getElementsByName("category");
    checkboxes.forEach((checkbox)=>{
        if(checkbox.checked == true){
            categories.push(checkbox.id);
        }
    })
    
    const newrecipe = {
        "name": name_text.value,
        "ingredients": ingredients,
        "instructions": instructions,
        "categories": categories,
        "images": imagedata.ids
    }

    response = await fetch("/recipe/",{
        method: "post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(newrecipe)
    })
})


/*
help for adding checkboxes from stackoverflow
https://stackoverflow.com/questions/866239/creating-the-checkbox-dynamically-using-javascript
*/
async function getCategories(){
    const response = await fetch("/category");
    const data = await response.json();

    data.forEach((category)=>{
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "category";
        checkbox.id = category.name;

        let label = document.createElement("label");
        label.htmlFor = category.name;
        label.appendChild(document.createTextNode(category.name));
    
        categorycontainer.appendChild(checkbox);
        categorycontainer.appendChild(label);
        categorycontainer.appendChild(document.createElement("br"));
    })
}
getCategories();