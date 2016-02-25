angular factory that help build directive with complex data like that :
 
 ```html
  <collection data="item.value as item.first for item in data index by item.id"></collection>
 ```

with a breeze


[x]todo: better doc

first step is to define pattern of the expected data. like which key we need to know about in the directive
we do that by using a simple templete like this:

```js
var dataPattern = '(@model as)? (@label for)? (_instance_ in @source@) (index by @index)?';
```

every group define a key that we are looking for and `@keyword` is the key that we got in the
final object that hold the data that expressed in that position

the use is very simple. if we take controller for the simplicity is look like this:

```js
    module.controller('mainController',function ($scope, DataParser){
         $scope.data = [
            {id:1,label:'first'},
            {id:2,label:'second'}
        ];
        
        this.parser =  DataParser.compile(dataPattern);
        var dataExpression = 'item.id as item.label for item in data';
        this.fixPatternData = $scope.parser( dataExpression, $scope );
});

```

next example is how build directive with that 

```js

    module.directive('collection', function (DataParser) {
        var Parser = DataParser.compile(dataPattern);
        return {
             scope:true,
             templateUrl:'tpl.html',
             link: function (scope,element,attrs) {
                 scope.parser = Parser(attrs.data, scope)
             }
        }
    });

```
tpl.html
```html
    <ul ng-repeat="item in parser()">
        <li><label>model:</label> {{item.model}} </li>
        <li><label>label:</label> {{item.label}} </li>
        <li><label>index:</label> {{item.index}} </li>
    </ul>
```
