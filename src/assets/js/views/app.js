// js/views/app.js

var app = app || {};

app.AppView = Backbone.View.extend({

  el: $('main'),

  // Watch for user initiated events in the DOM.
  // Call these methods, which will alter the model.
  events: {
    'keypress #searchbar': 'createSearchResults',
    'click #showMoreResults': 'createMoreSearchResults',
    'click #saveDay': 'addSavedDay'
  },

  initialize: function() {
    self = this;
    this.$searchbar = $('#searchbar');
    this.searchresultslist = $('#searchresultslist');
    this.foodtable = $('#foodtable');
    this.showMoreResults = $('#showMoreResults');
    this.lastSearchInput = '';
    this.rangeStart = 0;
    this.rangeEnd = 3;
    this.saveDay = $('#saveDay');
    this.savedDayRow = $('.saved-days-row');
    this.savedDaysCount = 0;
    this.useLastSearchInput = false;


    // Listen for changes in the model.
    // Call these methods, which will  alter the view accordingly:

    this.listenTo(app.searchresults, 'add', this.addSearchResults);
    this.listenTo(app.foods, 'add', this.addFood);
    this.listenTo(app.foods, 'add', this.clearSearchResults);
    this.listenTo(app.foods, 'remove', this.addAllFoods); // rebuild view of foods.
    this.listenTo(app.foods, 'reset', this.addAllFoods);
    this.listenTo(app.foods, 'reset', this.render);
    this.listenTo(app.foods, 'update', this.render);

    this.showMoreResults.hide();
    this.saveDay.hide();
  },

  render: function() {

    if (app.foods.length > 0) {
      this.saveDay.show();
      this.addTotalCals();
    } else {
      this.saveDay.hide();
      self.$("#foodtable #table-total-row").remove();
    }
  },

  addTotalCals: function() {
    var calCount = 0;
    app.foods.each(function(food) {
      calCount += food.get('calories');
    });
    self.$("#foodtable #table-total-row").remove();
    self.foodtable.append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');
  },

  createSearchResults: function( event ) {

    if (self.useLastSearchInput) {
      var searchInput = self.lastSearchInput;
    } else {
      if ( event.which !== ENTER_KEY || !this.$searchbar.val().trim() ) {
        return;
      }
      var searchInput = this.$searchbar.val().trim();
      self.lastSearchInput = searchInput; // saved for more searches.
      self.rangeStart = 0;
      self.rangeEnd = 3;
      app.searchresults.reset();
    }

    var range = '' + self.rangeStart + ':' + self.rangeEnd + '';

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

    this.$searchbar.val('');
    self.useLastSearchInput = false;
  },

  // Add the search results to view.
  // Add "Show More Matches" button too.

  addSearchResults: function() {
    self.$("#searchresultslist li").remove();

    app.searchresults.each(function(result) {
      var searchresultView = new app.SearchResultView({model: result});
      self.searchresultslist.append(searchresultView.render().el);
    });

    self.showMoreResults.show();
  },

  createMoreSearchResults: function() {
    self.rangeStart += 3;
    self.rangeEnd += 3;
    self.useLastSearchInput = true;
    this.createSearchResults();
  },

  clearSearchResults: function() {
    app.searchresults.reset(); 
    self.$("#searchresultslist li").remove();
    self.lastSearchInput = '';
    self.rangeStart = 0;
    self.rangeEnd = 3;
    this.useLastSearchInput = false;
    self.showMoreResults.hide();
  },
  
  addFood: function(food) {
      var foodView = new app.FoodView({model: food});
      self.foodtable.append(foodView.render().el);
  },

  addAllFoods: function() {
    self.$("#foodtable .table-data-food").remove();
    app.foods.each(this.addFood, this);
  },

  addSavedDay: function() {
    self.savedDaysCount++;
    app.foodsSavedDay = app.foods.clone();
    var calCount = 0;

    if ( self.savedDaysCount % 4 === 1 && self.savedDaysCount > 1 ) {
      self.savedDayRow.after('<section class="row saved-days-row"></section>');
      self.savedDayRow = $('.saved-days-row:last');
    }

    self.savedDayRow.append('<div class="col-xs-12 col-sm-6 col-md-3"><div>Day ' + self.savedDaysCount + '</div><table class="table table-striped table-bordered table-condensed table-hover table-day' + self.savedDaysCount + '"><tbody><tr><th>Food</th><th>Calories</th></tr>');

    app.foodsSavedDay.each(function(food) {
      calCount += food.get('calories');
      var foodSavedDayView = new app.FoodSavedDayView({model: food});
      $('.table-day' + self.savedDaysCount + ' tbody').append(foodSavedDayView.render().el);
    });

    $('.table-day' + self.savedDaysCount + ' tbody').append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');

    self.savedDayRow.append('</tbody></table></div>');

    app.foodsSavedDay.reset();
    app.foods.reset();
  }
});
