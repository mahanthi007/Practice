/*Create a company object with some keys print all the keys along with their values
Given an array of items find the elements that occur more than once
Create a user object with array of address objects print all the city names along with the pincodes of the addresses
Create a square object with two methods to calculate the perimenter and area of the square
Create a user object with a marks key having an array of subject marks, with a method to add a new subject marks and also methods to calculate the lowest, highest and total marks*/
var company ={
    name:"infotech",
    type:"IT",
    location:"Bangalore",
    employes:2000,
}
for(key in company){
    console.log(key+"-"+company[key])
}
console.log("")
//
var item = ['a','f','e','a','c','q','f']
var it_obj={}
for(var i=0; i<item.length; i++){
    var key=item[i]
    if(it_obj[key]==undefined){
        it_obj[key]=item[i]
    }
}
console.log("")
//
var user = {
    name:"mahanthi",
    address:[
        {city:'BLR', pin:'560061',state:'KA'},
        {city:'PUN', pin:'566061',state:'Mh'},
        {city:'HYD', pin:'567061',state:'TS'},
        {city:'CHE', pin:'568061',state:'TN'},
    ]
}
for(var i=0;i<user.address.length; i++){
    var adr=user.address[i]
    console.log(adr.city+"-"+ adr.pin)    
}
console.log("")
//
var square = {
    side:4,
    perimeter:function(){
        return this.side*4
    },
    area: function(){
        return this.side**2
    }
}
console.log(square.perimeter())
console.log(square.area())
console.log("")
//
var student = {
    name: "mahanthi",
    marks:[
        {subject: 'Eng', marks:10},
        {subject: "Sci",marks:5},
    ],
    addmarks: function(s, m){
        var item={subject: s, marks: m};
        this.marks.push(item);
    },
    leastmarks: function(){
        var least = {}
        for(var i=0; i< this.marks.length; i++){
            if(least.marks==undefined||this.marks[i].marks<least.marks){
                least=this.marks[i]
            }
        }
        return least
    },
    highestmarks:function(){
        var highest=this.marks[0];
        for(var j=0; j<this.marks.length; j++){
            var cur_sub=this.marks[j];
            if(cur_sub.marks>highest.marks){
                highest=cur_sub;
            }
            }
            return highest
        }
    }
student.addmarks('Mat', 20);
console.log(student.marks)
console.log(student.leastmarks())
console.log(student.highestmarks())
//