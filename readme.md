Angular factory that bring a breez to build directives that need to deal with complex data. so it look like just they way angularJs do that.

###### Example

So lets assume we have array of data: 

```
 data = [{  id:0,  value: 123,   name:'foo' },{   id:1,  value: 321,   name:'boo' }, ... ]
```

for the pattern 

```js
var dataPattern = '(@model as)? (@label for)? (_instance_ in @source@) (index by @index)?';
```

You can build directive that get described data 

```html
  <my-collection data="item.value as item.name for item in data index by item.id"></my-collection>
```

By write somthing like that 

```js
    module.directive('myCollection', function (DataParser) {
        var Parser = DataParser.compile(dataPattern);
        return {
             scope:true,
             templateUrl:'
              <ul ng-repeat="item in parser()">
               <li><label>model:</label> {{item.model}} </li>
               <li><label>label:</label> {{item.label}} </li>
               <li><label>index:</label> {{item.index}} </li>
              </ul>
             ',
             link: function (scope, element, attrs) {
                 scope.parser = Parser(attrs.data, scope)
                 /* from now on  
                 scope.parser() === [{model:123, lable:'foo', index:0}, {model:321, lable:'boo', index:1}, ... ]
                 And better then that. every time outside `data` will update `scope.parser` will update too.
                 */
             }
        }
    });

```
### How It Work 
First step is to define pattern of the expected data. which data key we need to know about.
Each word in dataPattern that start with `@` the parser mark as keyword for export object and for exparion that need
to evalute in user input string . If some part of the pattern surrounded by brackets with a question mark at the end it 
mean it not mandatory so user can describe them or not,  it expected but optional. 

If user not descibe that parts the `@key` appear in the generete object with value `undefind`  

Every part that surrounded by brackets is a group that define a key  we looking for it. and the word that start with `@` in the group is the key that hold the expressed value from the user .


