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
First step is to define pattern for the expected data, which data key we need to know about.
Every part that surrounded by brackets is a group that define a key  we looking for it. and the word that start with `@` in the group is the key that hold the expressed value from the user .
   
Each word in `dataPattern` that start with `@` marked as keyword for exported object and placeholder  exparion that will need
to evalute as value for the keyword . If some part of the pattern will surrounded by brackets with a question mark at the end it 
meen it expected but optional. If user not descibe that parts the value  will be `undefind`   

There is two specil key words 

#### `_instance_` 
surrounded with `_`,  that key will hold at the end the orginal instance of the object from the outer array. 

the second 

#### `@source@` 
reprecent expression that return the collection of all instances. 

