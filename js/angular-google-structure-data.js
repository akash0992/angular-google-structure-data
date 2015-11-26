/**
 * @author: Deepak Vishwakarma
 * @version: 0.0.2
 * @copyright: deepak.m.shrma@gmail.com
 */
(function (window, angular, undefined) {
    'use strict';
    angular.module('ngGoogleStructureData', [])
        .provider('GoogleStructureData', function () {
            var defaultValue;
            /**
             *
             * @param value
             * @returns {*}
             */
            this.setSomeDefaultValue = function (value) {
                //dummy method
                defaultValue = value;
                return this;
            };
            /**
             *
             * @type {*[]}
             */
            this.$get = [function () {
                var that = this, defaultValue;
                that.setSomeDefaultValue = function (value) {
                    //dummy method
                    defaultValue = value;
                    return this;
                };
                return {
                    setSomeDefaultValue: that.setSomeDefaultValue
                };
            }];
        })
        .directive('ngStructureData', function ($filter) {
            function getArticleJson(content, type) {
                var ldJson = {
                    "@context": "http://schema.org/",
                    "@type": 'NewsArticle' || type,
                    "description": content.description || '',
                    "headline": content.headline || '',
                    "datePublished": $filter('date')(content.datePublished || Date.now(), 'yyyy-MM-dd HH:mm:ss Z'),
                    "alternativeHeadline": content.alternativeHeadline || '',
                    "articleBody": content.alternativeHeadline || ''
                };
                if (content.image) {
                    ldJson.image = [].concat(content.image);
                }
                return ldJson;
            }

            function getRecipeJson(content, type) {
                var ldJson = {
                    "@context": "http://schema.org/",
                    "@type": 'Recipe' || type,
                    "description": content.description || '',
                    "name": content.name || '',
                    "recipeIngredient": [],
                    "recipeInstructions": ""
                };
                if (content.author) {
                    ldJson.author = {
                        "@type": "Person",
                        "name": content.author.name

                    }
                }
                if (content.datePublished) {
                    ldJson.datePublished = $filter('date')(content.datePublished || Date.now(), 'yyyy-MM-dd HH:mm:ss Z');
                }
                if (!content.prepTime) {
                    content.prepTime = 0;
                }
                if (!content.cookTime) {
                    content.cookTime = 0;
                }
                ldJson.cookTime = "PT" + content.cookTime + "M";
                ldJson.prepTime = "PT" + content.prepTime + "M";
                ldJson.totalTime = "PT" + (content.totalTime || (content.cookTime + content.prepTime)) + "M";
                ldJson.recipeYield = $filter('number')(content.recipeYield || 0) + " Portioner"
                if (content.rating) {
                    var value = Number(content.rating.value);
                    var raters = Number(content.rating.raters);
                    ldJson.aggregateRating = {
                        "@type": "AggregateRating",
                        "ratingValue": !isNaN(value) ? value.toFixed(2) : 0.0,
                        "reviewCount": !isNaN(raters) ? raters.toFixed(0) : 0
                    }
                }
                if (content.image) {
                    ldJson.image = content.image;
                }
                if (content.nutrition) {
                    ldJson.nutrition = {
                        "@type": "NutritionInformation",
                        "servingSize": content.nutrition.servingSize || '',
                        "calories": content.nutrition.calories || '',
                        "fatContent": content.nutrition.fatContent || ''
                    };
                }
                if (content.ingredients && content.ingredients.length) {
                    angular.forEach(content.ingredients, function (ingredient) {
                        ldJson.recipeIngredient.push(ingredient.name + ": " + ingredient.amount + ' ' + (ingredient.unit || ''))
                    });
                }
                if (content.instructions && content.instructions.length) {
                    ldJson.recipeInstructions = content.instructions.join('\n');
                }
                return ldJson;
            }
            return {
                restrict: 'A',
                scope: {
                    structType: '@',
                    content: '='
                },
                link: function ($scope, element) {
                    var acceptableTypes = ['Recipe', 'NewsArticle'], ldJson;
                    if (!$scope.structType || acceptableTypes.indexOf($scope.structType) < 0) {
                        console.info('ngStructureData: Either structType is not define Or not supported!');
                        return;
                    }
                    if (!$scope.content) {
                        console.info('ngStructureData: content is not set yet!');
                        console.info('ngStructureData: Use ng-if to create ngStructureData');
                        return;
                    }
                    switch ($scope.structType) {
                        case 'Recipe':
                            ldJson = getRecipeJson($scope.content);
                            break;
                        case 'NewsArticle':
                            ldJson = getArticleJson($scope.content);
                            break;
                    }
                    element.html(JSON.stringify(ldJson));
                }
            };
        });
})(window, window.angular);
