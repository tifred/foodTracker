var app=app||{};app.SearchResultView=Backbone.View.extend({tagName:"li",template:_.template($("#search-result-template").html()),events:{"click .search-result-data":"createFoodandRecentResults"},initialize:function(){},render:function(){return this.$el.html(this.template(this.model.attributes)),this},createFoodandRecentResults:function(){var e=this.model.get("name"),t=this.model.get("calories");app.foods.create({name:e,calories:t}),app.recentresults.create({name:e,calories:t})}});