// js/views/app.js

var app = app || {};

app.AppView = Backbone.View.extend({

  el: $('main'),

  // Watch for user initiated events in the DOM.
  // Call these methods, which will alter the model.
  events: {
    'keypress #searchbar': 'createSearchResults',
    'click #showMoreResults': 'createMoreSearchResults',
    'click #saveDay': 'createSavedDay'
  },

  initialize: function() {
    self = this;
    this.$searchbar = $('#searchbar');
    this.searchresultslist = $('#searchresultslist');
    this.recentresultslist = $('#recentresultslist');
    this.foodtable = $('#foodtable');
    this.showMoreResults = $('#showMoreResults');
    this.loadingResults = $('#loadingResults');
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
    this.listenTo(app.recentresults, 'add', this.addRecent);
    this.listenTo(app.recentresults, 'add', this.clearSearchResults);

    this.showMoreResults.hide();
    this.loadingResults.hide();
    this.saveDay.hide();
 
    app.recentresults.fetch();
    app.foods.fetch();
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
      this.loadingResults.show();
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
    self.loadingResults.hide();
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

  addRecent: function(result) {
      var recentView = new app.RecentResultView({model: result});
      self.recentresultslist.append(recentView.render().el);
  },
  
  addFood: function(food) {
      var foodView = new app.FoodView({model: food});
      self.foodtable.append(foodView.render().el);
  },

  addAllFoods: function() {
    self.$("#foodtable .table-data-food").remove();
    app.foods.each(this.addFood, this);
  },

  createSavedDay: function() {
    app.allSavedDays = app.allSavedDays || [];
    app.allSavedDays.push(app.foods.clone());
   //  app.foods.reset();
    this.addSavedDays();
  },

  addSavedDays: function() {
    self.savedDayRow.find('div').remove();


    for (var i = 0; i < app.allSavedDays.length; i++) {
      var dayNum = i + 1;
      var calCount = 0;
      self.savedDayRow.append('<div class="col-xs-12 col-sm-6 col-md-3"><div>Day ' + dayNum + '</div><table class="table table-striped table-bordered table-condensed table-hover table-day' + dayNum + '"><tbody><tr><th>Food</th><th>Calories</th></tr>');
      app.allSavedDays[i].each(function(food) {
	calCount += food.get('calories');
	var foodSavedDayView = new app.FoodSavedDayView({model: food});
	$('.table-day' + dayNum + ' tbody').append(foodSavedDayView.render().el);
      });

      $('.table-day' + dayNum + ' tbody').append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');

      self.savedDayRow.append('</tbody></table></div>');
    }
    _.chain(app.foods.models).clone().each(function(model) {
      model.destroy();
    });

  }
});
