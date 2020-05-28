/*
 *https://www.npmjs.com/package/axios
 */
const axios = require('axios');

/*
  Je souhaite, au clic sur le bouton "Charger la suite" afficher les recettes suivantes.

  1/ Ajouter un écouteur d'évènement "click" sur notre bouton (dans la méthode init)

  2/ Construire la requete ajax & l'executer via Axios (il y a déjà une méthode qui semble faire le taff)

  3/ Afficher les nouvelles recettes reçues (il y a déjà une méthode qui semble faire le taff)
*/

// Je déclare un objet app
var app = {

  // Je créé une propriété de mon objet app pour contenir mon url (a un seul endroit)
  baseUrl: 'http://localhost/WP/O-Cooking/WP-Support-oCooking/wp-json/wp/v2/',
  perPage: 4,
  currentPage: 1,
  elements: [],

  // J'ai une méthode init pour être appelée à la fin du chargement de la page
  init: function() {

    // Je fait un petit console.log, histoire de valider que ma méthode est bien lancée
    console.log('init');

    // Je cible une bonne fois pour toute, l'element du DOM qui va recevoir mes titres de recette
    app.elements['tbody'] = document.querySelector('.recipe-list');
    // Je cible une bonne fois pour toute, l'element du DOM qui me sert de template
    // pour la liste des recettes
    app.elements['template'] = document.querySelector('#recipe-list-item-template');

    // Je cible mon bouton avec le querySelector
    // puis je lui dépose/accroche un écouteur d'évenement de type click
    // Ainsi a chaque click effectué sur mon bouton la méthode "handle..." sera executée
    document.querySelector('.loadNextRecipeList').addEventListener('click', app.handleClickBtnLoadMore);

    // Je vais mettre en place ici une délégation d'écoute.
    // En effet je souhaite surveiller les clicks sur mes boutons "Voir"
    // Or, ceux-ci au chargement de la page n'existent pas encore.
    // De plus je risque d'avoir de plus en plus de bouton à surveiller.
    // Pour palier à ces problèmes, je vais demander à tbody de surveiller ses enfants.
    app.elements.tbody.addEventListener('click', function(event) {

      // Si j'ai cliqué directement sur le bouton... ou sur un de ses enfants
      // https://developer.mozilla.org/fr/docs/Web/API/Element/closest
      if(event.target && event.target.closest('.showRecipe') !== null) {

        // console.log('J\'ai clické sur le bouton pour voir la recette');
        app.handleClickBtnShowRecipe(event);
      }
    });

    // A la fin de l'initialisation, j'execute automatiquement la méthode "loadRecipeList"
    app.loadRecipeList();
  },

  // Création de la méthode loadRecipeList afin de charger la liste des recettes
  loadRecipeList: function() {

    console.log('Je vais charger les recettes !');

    axios
      .get(app.baseUrl + 'recipe?per_page=' + app.perPage + '&page=' + app.currentPage)

      // Si tout ce passe bien dans ma requete ainsi que dans la réponse,
      // mon .then va être executé
      .then(app.handleReceiveRecipe)

      // Si il y a un problème dans ma requete ou si le serveur n'arrive pas a
      // me répondre, mon .catch va être executé
      .catch( function(error) {
        // handle error
        console.log('Tout va mal !');
        console.log(error);
      });

    console.log('Ma méthode loadRecipeList est terminée');
  },

  handleReceiveRecipe: function(response) {

    // handle success
    console.log('Tout va bien !');
    console.log(response);

    // J'ai ici ma variable response, celle-ci est un objet
    // J'aimerai connaitre (et afficher) les propriétés qui la compose

    // console.log('Dans mon objet response il y a:');
    // for (const responseProperty in response) {

      // console.log(responseProperty);
    // }

    // console.log(response.status);
    // console.log(response.statusText);

    // let data = response.data;

    // console.log(data[0].title.rendered);

    /* Premiere solution pour afficher mes titres : la boucle for
    for (let index = 0; index < data.length; index++) {

      console.log(index);
      console.log(data[index].title.rendered);
    }
    */

    /* Deuxième solution pour afficher mes titre: utiliser la METHODE forEach sur mon tableau*/
    response.data.forEach(function(dataValue) {

      // console.log(dataValue);
      // console.log(dataValue.title.rendered);

      app.createNewRecipeItem(dataValue.title.rendered);
    });

    // Maintenant que mes recettes sont affichées, j'aimerai déterminé
    // si je doit afficher le bouton "charger plus"

    app.toggleBtnLoadMore(response.headers['x-wp-total']);
  },

  createNewRecipeItem: function(recipeTitle) {

      // Je cible l'element du DOM qui va recevoir mes titres de recette
      // let tbody = document.querySelector('.recipe-list');

      // console.log(tbody);

      // Sur mon tbody je vais manipuler son contenu.
      // Ici, je viens lui définir ce qu'il contient (ici notre titre de recette)
      // tbody.textContent = dataValue.title.rendered;

      // Le problème est que mon contenu est remplacé à chaque itération
      // du coup j'ai que le nom de la derniere recette qui s'affiche.

      // Solution:
      // j'incrémente le contenu de mon tbody (le +=)
      // tbody.textContent += dataValue.title.rendered;

      // Maintenant j'ajoute du HTML
      // tbody.textContent += '<tr><td>'+dataValue.title.rendered+'</td><td>Action à définir</td></tr>';
      // Pour que mon HTML soit interprété comme du HTML et non pas juste du texte
      // j'utilise innerHTML
      // tbody.innerHTML += '<tr><td>'+dataValue.title.rendered+'</td><td>Action à définir</td></tr>';

      // let template = document.querySelector('#recipe-list-item-template');

      /* Ici ma variable template contient, non pas du texte mais un element du DOM
        = un pointeur vers mon element du DOM */

      /* Du coup si je souhaite réaliser une copie de cet element, la "technique" habituelle
      pour dupliquer des variables ne fonctionne pas:

      let toto = template;

      ici ma variable toto, ne vas pas contenir un autre element mais au final le même "pointeur"
      et donc le même element du DOM
      */

      // Ici, je demande à mon DOM de me DUPLIQUER le contenu de ma boite.
      // ainsi ma variable clone contient un nouvelle ELEMENT du DOM, pas encore présent dans la page.
      let clone = document.importNode(app.elements.template.content, true);

      // Dans mon nouvel element, je cible le td qui va contenir le titre
      // puis je lui ajoute un texte: le titre de la recette
      clone.querySelector('.recipeTitle').textContent = recipeTitle;

      // Je cible désormais mon tbody et je lui déclare un nouvel enfant: mon clone
      app.elements.tbody.appendChild(clone);
  },

  toggleBtnLoadMore: function(nbrTotalRecipe) {

    // 1/ Je récupere le nombre de recette au total à afficher

    /* Rappel:

        Pour cibler des clé dans un objet, on utilise généralement le .

        Ex: myObject.myProperty;

        Cependant il est toujours possible d'utiliser les crochets

        Ex: myObject['myProperty'];

        La solution 1 est toujours à privilégier mais parfois lorsque le
        nom de la propriété ne respecte pas les normes de JS, il ne sera pas possible
        de l'utiliser.
        La solution 2 sera alors notre seule alternative possible.
      */

    //  let nbrTotalRecipe = response.headers['x-wp-total'];

     // console.log(nbrTotalRecipe);

     // 2/ Connaitre le nombre de recette qu'on affiche déjà

       // Je demande à mon element tbody combien il a d'enfants (direct)
       // Je vais ainsi pouvoir connaitre le nombre de recette affichées.
     let nbrRecipeDisplayed = app.elements.tbody.childElementCount;

     // 3/  La condition pour savoir si je doit afficher mon bouton "charger plus"
     if (nbrTotalRecipe > nbrRecipeDisplayed) {

        // Je cible le footer du tableau
        // puis je lui supprime la classe "is-hidden" afin de l'afficher
        document.querySelector('.loadNextRecipeListContainer').classList.remove('is-hidden');

      // Dans le cas contraire
     } else {

      // J'ajoute la classe "is-hidden" à mon élément
      document.querySelector('.loadNextRecipeListContainer').classList.add('is-hidden');
     }
  },

  handleClickBtnLoadMore: function() {

    // Puisque je souhaite charger de nouvelles recette,
    // j'incrémente mon numero de page
    app.currentPage++;

    app.loadRecipeList();
  },

  handleClickBtnShowRecipe: function(event) {

    console.log('Un click sur le bouton voir à eu lieu');
    console.log(event.target);

    /*
      Afin de récuperer les informations de la recette en question il va falloir que je connaisse l'id de cette recette

      TODO:
        Via l'utilisation de dataset, "stocker" l'id de la recette qu'il contient sur chaque TR

        Via l'utilisation de dataset, "récuperer" l'id de la recette du TR contenant le bouton sur lequel on vient de cliquer

        Utiliser Axios afin d'interroger la REST API sur une recette en particulier (en fonction de son ID)

        Récuperer la réponse de la REST API pour remplir & afficher la modal
    */
  }
};

document.addEventListener('DOMContentLoaded', app.init);
