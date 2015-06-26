/**
 * Created by pery on 26/06/2015.
 */
"use strict";
"use strict";
/**
 * Created by pery on 13/02/2015.
 */
/**
 * ALERT: this is a expert infrastructure code, Hard to read Hard to Change Easy to use.
 * so if you plan reading, take your time.
 * if you plan changing, know what you do. not changed as 'by the way'
 * if you plan to use, read the comments or find example
 */
//var _ = require('lodash');
angular.module('dataParser',[])

    .factory('DataParser',['$parse',function ($parse) {
        /**API*/
        return {
            breaksNaturalSentence :statementDecoder,
            compile : compile
        };

        /**
         * ((@modelMapper as)? (@itemLabel for)? (_instance_ in @source@) (branch by @branch)? (index by @indexBy)?
         *
         * take sentence like above and convert it to regex that can take sentence and break then to part
         * so it can break sentence like:
         * "{name:topic.name,id:topic.id} as topic.name for topic in topicsFilter branch by topic.children index by topic.id"
         **/
        function  statementDecoder (describesPattern){
            var FIND_GROUP = /(\([\s\S]+?\)\??)/g,
                groups = describesPattern.match(FIND_GROUP)
                ;

            var HARD_WHITE_SPACE = '\\s+';
            var SOFT_WHITE_SPACE = '\\s*';
            var SUPER_HARD_WHITE_SPACE = '\\s';
            var EXPIRATION_WITH_SPACES = '([\\s\\S]+?)';
            var EXPIRATION_WITHOUT_SPACES = '([\\S]+?)';
            var keywords = [];
            var alias = [];
            var sources = [];
            var expressions = [];

            groups = groups.map(function ( group, i ) {
                group = group
                    //replace _str_ with expression represent instance name
                    .replace(/_([\w]+)_/g,replaceAndCollect(EXPIRATION_WITHOUT_SPACES,i,alias) )
                    //replace @exp@ with expression represent source array
                    .replace(/@([\w]+)@/g,replaceAndCollect(EXPIRATION_WITHOUT_SPACES,i,sources) )
                    //replace !@ with expression finder(not return word after space)
                    .replace(/!@([\w]+)/g,replaceAndCollect(EXPIRATION_WITHOUT_SPACES,i,expressions))
                    //replace @ with expiration finder(can take white space, stop just if find next group match)
                    .replace(/@([\w]+)/g,replaceAndCollect(EXPIRATION_WITH_SPACES,i,expressions))
                    //replace white space with regex
                    .replace(/\s+/g,HARD_WHITE_SPACE)
                    //repace _ with just one white space
                    .replace(/_/g,SUPER_HARD_WHITE_SPACE)
                ;
                return group[0]+'?:'+group.slice(1);
            });

            var sentenceExpression =  '^'+SOFT_WHITE_SPACE + groups.join(SOFT_WHITE_SPACE)+SOFT_WHITE_SPACE+'$';
            var regex = new RegExp(sentenceExpression);
            regex.keywords = keywords;
            regex.alias = alias;
            regex.sources = sources;
            regex.expressions = expressions;
            return regex;

            function replaceAndCollect(replacerExparation,i,collectionIndexs){
                return function(match,p1,offset,string){
                    //added to keyword collection for save consist index reference
                    keywords.push(p1);
                    collectionIndexs && collectionIndexs.push(keywords.length-1);
                    return replacerExparation
                }
            }
        }


        //'(@modelMapper as)? (@itemLabel for)? (@instance in @source) (branch by @branch)? (index by @indexBy)?'
        function compile(describesPattern){
            var regexParser = statementDecoder(describesPattern)
                //all keywords that declare in the describesPattern
                ,keywords = regexParser.keywords
                // all indexed keywords represent the instance
                ,instances = regexParser.alias
                // all keywords index that building the model
                ,keysModel = regexParser.expressions
                //keyword indexed of data array/collection
                ,sources = regexParser.sources
                ;

            //keysModel.push.apply(keysModel,alias); // identity expiration

            return function parser(expression, scope){
                var exprsions = expression.match( regexParser );
                if (!exprsions) {
                    console.error('iexp', "Expected expression in form of '"+describesPattern+"' but got '{0}'.Element: {1}");
                }
                exprsions.shift(); //first match not needed Because it equal to all sentence.
                var keywordsGetter = exprsions.map(function (exp) {
                    return $parse(exp,false);
                });

                var instanceMap = {};

                instances.forEach(function (index) {
                    Object.defineProperty(instanceMap, exprsions[index],{get: thisInstance});
                });
                function thisInstance (){
                    return this.instance;
                }
                var modelMapper = {};
                keysModel.forEach(function (index) {
                    modelMapper[keywords[index]] = keywordsGetter[index];
                });

                function transformer(item){
                    var model = Object.create(instanceMap);
                    model.instance = item;
                    _.forEach(modelMapper,function (getter, key) {
                        model[key] =  getter( scope, model );
                    });
                    return model;
                }


                var source;
                var itrator = function(items, transformer){
                    return _.map(items,transformer);
                };
                scope.$watch(exprsions[sources[0]], function (items) {
                    source = itrator( items, transformer) || items  ;
                });

                var expor =  function () {
                    return source;
                };

                angular.extend(expor,{
                    raw:{
                        source:sources,
                        alias:instances,
                        keywords: _.zipObject(keywords,keywordsGetter)
                    } ,
                    transformer:transformer,
                    setItrator:function(fn){
                        itrator = fn;
                    }
                });
                return expor;
            }
        }

        //function warpeItem(items, getters ){
        //    items = items.map(function (item) {
        //
        //        return
        //
        //
        //    })
        //
        //}

    }]);

