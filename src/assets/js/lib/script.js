(function($) {
  var Food = Backbone.Model.extend({
    defaults: {
      name: 'gruel',
      calories: 200
    },
    addCalories: function() {
      this.set("calories", this.get("calories") + 100);
    }
  });

  var Foods = Backbone.Collection.extend({
    model: Food
  });

  var foods = new Foods([
    new Food({name: 'chicken', calories: 600}),
    new Food({name: 'rice', calories: 200}),
    new Food({name: 'chocolate', calories: 300})
  ]);

  var FoodView = Backbone.View.extend({
    tagName: 'li',

    events: {
      'click': 'addCaloriesToFood'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      this.$el.html('<div>Type of Food: ' + this.model.get("name") + '</div><div>Calories:&nbsp;' + this.model.get("calories") + '</div>'); 
      return this; 
    },

    addCaloriesToFood: function() {
      this.model.addCalories();
    }
  });

  var App = Backbone.View.extend({

    el: $('ul'),

    initialize: function() {
      self = this;
      this.total = $('#total');

      this.listenTo(foods, 'change', this.render);

      foods.each(function(food) {
        var foodView = new FoodView({model: food});
        self.$el.append(foodView.render().el);
      });

      this.render(); 
    },

    render: function() {
      var calCount = 0;
      foods.each(function(food) {
        calCount += food.get('calories');
      });
      this.total.text('Total Calories: ' + calCount);
    }
  });
 
  new App();
})(jQuery);







