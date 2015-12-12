// js/views/app.js

var app = app || {};

app.AppView = Backbone.View.extend({

  el: $('main'),

  /*
      Watch for user initiated events in the DOM.
      Call these methods, which will alter the model.
  */

  events: {
    'keypress #searchbar': 'createSearchResults',
    'click #showMoreResults': 'createMoreSearchResults',
    'click #saveDay': 'createSavedDay'
  },

  initialize: function() {
    self = this;
    this.$searchbar = $('#searchbar');
    this.$searchresultslist = $('#searchresultslist');
    this.$recentresultslist = $('#recentresultslist');
    this.$foodtable = $('#foodtable');
    this.showMoreResults = $('#showMoreResults');
    this.loadingResults = $('#loadingResults');
    this.$saveDay = $('#saveDay');
    this.$savedDayRow = $('.saved-days-row');
    this.savedDaysCount = 0;

    // needed to make the "show more" searches button work.
    this.rangeStart = 0;
    this.rangeEnd = 3;
    this.lastSearchInput = '';
    this.useLastSearchInput = false;

    /* 
        Listen for changes in collections of models.
        Call these methods, which will alter the view.
        The "add", as in "addSearchResults", means to add to the DOM.
    */

    // when we have new searchresults, add them all to the DOM.
    this.listenTo(app.searchresults, 'add', this.addSearchResults);

    // adding one food is just an addition to the model.
    this.listenTo(app.foods, 'add', this.addFood);

    // always clear the search results after adding food to the list.
    this.listenTo(app.foods, 'add', this.clearSearchResults);

    // when a food is removed, remove all foods and add remaining ones again.
    this.listenTo(app.foods, 'remove', this.addAllFoods);

    // junk?
    this.listenTo(app.foods, 'reset', this.addAllFoods);

    // render on reset and update to recalc total cals and show/hide save button.
    this.listenTo(app.foods, 'reset', this.render);
    this.listenTo(app.foods, 'update', this.render);

    // if we have recent results, add them to the DOM:
    this.listenTo(app.recentresults, 'add', this.addRecent);

    // junk?  I don't see any effect with it gone, but...
    // this.listenTo(app.recentresults, 'add', this.clearSearchResults);

    // Hide all three of these elements at first.
    this.showMoreResults.hide();
    this.loadingResults.hide();
    this.$saveDay.hide();
 
    // retrieve from localstorage upon load.
    app.recentresults.fetch();
    app.foods.fetch();
  },

  render: function() {

    /*
        If there are any foods to show, 
        display the calories total in the table
        and show the "Save This Day" button.
    */ 

    if (app.foods.length > 0) {
      this.$saveDay.show();
      this.addTotalCals();
    } else {
      this.$saveDay.hide();
      self.$("#foodtable #table-total-row").remove();
    }

  },

  /* Let the Methods Begin */

  addTotalCals: function() {
    var calCount = 0;
    app.foods.each(function(food) {
      calCount += food.get('calories');
    });
    self.$("#foodtable #table-total-row").remove();
    self.$foodtable.append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');
  },

  createSearchResults: function( event ) {

    /* An initial search will get three items from the API's url.
       Hitting the "Show More" button will get the next three items.
       "useLastSearchInput" signifies whether this is an initial 
       search or a "Show More" search.
    */
       
    if (self.useLastSearchInput) {
      // The "Show More" button was used, so use last input value.
      var searchInput = self.lastSearchInput;
    } else {
      // if the enter key was not hit or there is no value, do nothing.
      if ( event.which !== ENTER_KEY || !this.$searchbar.val().trim() ) {
        return;
      }
      // otherwise, do something with the current input:
      this.loadingResults.show(); // show "loading" while results come back.
      var searchInput = this.$searchbar.val().trim();
      self.lastSearchInput = searchInput; // save input for more searches.
      self.rangeStart = 0;
      self.rangeEnd = 3;
      app.searchresults.reset(); // clear out old searchresults.
    }

    // set range to e.g. 0:3 , 3:6 , etc.
    var range = '' + self.rangeStart + ':' + self.rangeEnd + '';

    /*
        Run API from nutritionix.
        This happens for both an initial search and a "Show More".
        Results will be in "data.hits[i]."
        Create new models in the searchresults collection.
        Upon failure, put an error in the searchresults collection.
    */

    var nutQuery = 'https://api.nutritionix.com/v1_1/search/' + searchInput + '?results=' + range + '&fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=c6f2c498&appKey=63a855793383d6e263e27c9993661a29'
    $.getJSON(nutQuery)
      .done(function(data) {
        for (var i = 0; i < data.hits.length; i++) {
          app.searchresults.create( {
            name: data.hits[i].fields.item_name,
            calories: Math.floor(data.hits[i].fields.nf_calories)
          });
        };
      })
      .fail(function() {
          app.searchresults.create( {
            name: "No results",
            calories: 0
          });
      });

    /*
        Clearing these out allows another search to be run
        without actually selecting a food.
        When a food is selected, the more extensive "clearSearchResults" runs.
    */

    this.$searchbar.val('');
    self.useLastSearchInput = false;
  },

  /*
      addSearchResults: Add the search results to the DOM.
      Add "Show More Matches" button too.
  */

  addSearchResults: function() {
    // remove all the li elements that held old search results.
    self.$("#searchresultslist li").remove();

    // loop through searchresults coll and add li's to the ul.
    app.searchresults.each(function(result) {
      var searchresultView = new app.SearchResultView({model: result});
      self.$searchresultslist.append(searchresultView.render().el);
    });

    self.showMoreResults.show();

    // Hide the "loading message", which started in createSearchResults.
    self.loadingResults.hide();
  },

  /*
      createMoreSearchResults: run when "Show More" button is clicked.
      Increase the range, set the "signal" variable to true.
      Then run createSearchResults method (should I use a trigger instead?)
  */

  createMoreSearchResults: function() {
    self.rangeStart += 3;
    self.rangeEnd += 3;
    self.useLastSearchInput = true;
    this.createSearchResults();
  },

  // This is run when an item is selected from searchresults.

  clearSearchResults: function() {
    app.searchresults.reset(); 
    self.$("#searchresultslist li").remove();
    self.lastSearchInput = '';
    self.rangeStart = 0;
    self.rangeEnd = 3;
    this.useLastSearchInput = false;
    self.showMoreResults.hide();
  },

  /* 
      addRecent: Adds recent results to DOM.
      The models in this collection are created when a user
      clicks on a search result.  See the "createFoodandRecentResults" method
      in the SearchResultView constructor/view.
  */

  addRecent: function(result) {
      var recentView = new app.RecentResultView({model: result});
      self.$recentresultslist.append(recentView.render().el);
  },
  

  /* 
      addFood: Adds one new food to the table in the DOM.
      The models in this collection are created when a user
      clicks on a search result.  See the "createFoodandRecentResults" method
      in the SearchResultView constructor/view.
  */

  addFood: function(food) {
      var foodView = new app.FoodView({model: food});
      self.$foodtable.append(foodView.render().el);
  },

  /*
      addAllFoods: Removes all foods from DOM; builds list again from scratch.
      Used when a single food is removed by the user.
  */

  addAllFoods: function() {
    self.$("#foodtable .table-data-food").remove();
    app.foods.each(this.addFood, this);
  },

  /* 
      NOTE: THE FOLLOWING IS A HACK.

      There has to be a better way to save days, using collections.
      I think I need a collection inside a collection.
      Ideas?
  */

  /*
      Push current "food" collection onto an array.
      Then run 'addSavedDays' to add to DOM (bad method too.)
  */

  createSavedDay: function() {
    app.allSavedDays = app.allSavedDays || [];
    app.allSavedDays.push(app.foods.clone());
    app.foods.reset();
    this.addSavedDays();
  },

  /* 
      addSavedDays: Add a table for each Saved Day.
      What is the right way to do this?
  */

  addSavedDays: function() {
    self.$savedDayRow.find('div').remove();

    for (var i = 0; i < app.allSavedDays.length; i++) {
      var dayNum = i + 1;
      var calCount = 0;
      self.$savedDayRow.append('<div class="col-xs-12 col-sm-6 col-md-3"><div>Day ' + dayNum + '</div><table class="table table-striped table-bordered table-condensed table-hover table-day' + dayNum + '"><tbody><tr><th>Food</th><th>Calories</th></tr>');
      app.allSavedDays[i].each(function(food) {
	calCount += food.get('calories');
	var foodSavedDayView = new app.FoodSavedDayView({model: food});
	$('.table-day' + dayNum + ' tbody').append(foodSavedDayView.render().el);
      });

      $('.table-day' + dayNum + ' tbody').append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');

      self.$savedDayRow.append('</tbody></table></div>');
    }

    // Save method to remove all models from foods collection.

    /* Bad side effects...
    _.chain(app.foods.models).clone().each(function(model) {
      model.destroy();
    });
    */
  }
});
