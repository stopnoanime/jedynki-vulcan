function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

//Wait for all grades to be loaded
waitForElm('#ext-element-171 [data-qtip]').then(_ => {
    const subjectTable = document.getElementById('ext-element-171');

    function calculateOnes(gradeSum, weightSum, demandedAverage, oneWeight) {
        const initialAverage = gradeSum/weightSum 
        if(initialAverage < demandedAverage) return `Twoja średnia ${initialAverage.toFixed(2)} jest mniejsza niż żądana ${demandedAverage}.`

        if(demandedAverage == 1) return "Możesz dostać tyle jedynek ile chcesz."

        //Math stuff
        const res = Math.floor((demandedAverage*weightSum - gradeSum)/(oneWeight*(1 - demandedAverage)))
        
        return res == 0 ? `Nie możesz już dostać żadnych jedynek.` : `Jeszcze ${res} 1️⃣`;
    }

    const labels = []
    const deleteLabels = () => labels.forEach(label => label.remove());

    function calculateLabels(demandedAverage, oneWeight) {
        deleteLabels();
        
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
            const [gradeSum, weightSum] = grades.reduce((acc, v) => {
                acc[0] += v.value * v.weight
                acc[1] += v.weight 
                return acc
            }, [0,0])

            const res = calculateOnes(gradeSum, weightSum, demandedAverage, oneWeight);
            if(res == null) return

            //Add label showing how many ones you can still get
            const badge = document.createElement("span");
            badge.textContent = res;
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
        <input id="demanded-average" type="number" value="2" min="1" step=".01" class="extension-menu-input"/>
    </label>

    <label style="margin-left: 20px;">
        Waga jedynek: 
        <input id="one-weight" type="number" value="1" min="1" class="extension-menu-input"/>
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

    const inputChange = () => {
        if(!demandedAverageInput.validity.valid || !oneWeightInput.validity.valid) deleteLabels();
        else calculateLabels(demandedAverageInput.value, oneWeightInput.value)
    }

    demandedAverageInput.oninput = inputChange
    oneWeightInput.oninput = inputChange

    //Initial calculate
    inputChange()
})
