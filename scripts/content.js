//Table congaing all subjects and grades
const subjectTable = document.getElementById('ext-element-171');

const labels = []
function calculateLabels(demandedAverage, oneWeight) {
    //Remove previously added labels
    labels.forEach(label => label.remove());

    //For every subject
    [...subjectTable.children].forEach(schoolSubject => {
        //Get all grades
        const spans = [...schoolSubject.querySelectorAll('[data-qtip]')]

        //Convert grade spans to values
        const grades = spans.map(grade => {
            const innerValue = grade.textContent.trim()
            const isProperGrade = /^\d[+-]?$/.test(innerValue)
    
            if(!isProperGrade) return null
    
            let value = parseInt(innerValue, 10)
            if(innerValue[1] == '+') value += 0.5;
            else if(innerValue[1] == '-') value -= 0.5;
    
            const weight = parseInt(grade.getAttribute('data-qtip').split("<br/>Waga: ")[1], 10)
    
            return {
                value: value,
                weight: weight
            }
        }).filter(o => o && o.weight > 0)
    
        if(grades.length == 0) return
    
        //Calculate weighted average
        const [sum, weightSum] = grades.reduce((acc, v) => {
            acc[0] += v.value * v.weight
            acc[1] += v.weight 
            return acc
        }, [0,0])

        const res = (demandedAverage*weightSum - sum)/(oneWeight*(1 - demandedAverage))

        //Add label showing how many ones you can still get
        const badge = document.createElement("span");
        badge.textContent = res < 0 ? `Twoja średnia jest mniejsza niż żądana. ${res}` : `Jeszcze ${Math.floor(res)} 1️⃣`;
        badge.style.color = "DarkSlateGray"
        badge.style.paddingLeft = "10px"
        spans[spans.length - 1].insertAdjacentElement("afterend", badge);
        labels.push(badge)
    })
}


//Generate input menu
const menu = document.createElement("div");
menu.innerHTML = `
<label>
    Pożądana średnia: 
    <input id="demanded-average" type="number" value="2" style="width: 60px; margin-left: 10px;"/>
</label>

<label style="margin-left: 20px;">
    Waga jedynek: 
    <input id="one-weight" type="number" value="1" style="width: 60px; margin-left: 10px;"/>
</label>
`;
menu.style.color = 'black';
menu.style.background = 'Gainsboro';
menu.style.marginTop = '10px';
menu.style.padding = "10px";
subjectTable.insertAdjacentElement("beforebegin", menu);

//Hook onto input changes
demandedAverageInput = document.getElementById('demanded-average')
oneWeightInput = document.getElementById('one-weight')

const inputChange = () => calculateLabels(demandedAverageInput.value, oneWeightInput.value)

demandedAverageInput.oninput = inputChange
oneWeightInput.oninput = inputChange