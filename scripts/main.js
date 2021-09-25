let tableSenate = document.getElementById("table-senate")
const app = Vue.createApp({
    data() {
        return {
            party: [],
            members: [],
            selectedStates: "",
            statistics: {
                democrats: 0,
                republicans: 0,
                independents: 0,
                avgVotesWithPartyDemocrats: 0,
                avgVotesWithPartyRepublicans: 0,
                avgVotesWithPartyIndependents: 0,
                avgMissedVotesPartyDemocrats: 0,
                avgMissedVotesPartyRepublicans: 0,
                avgMissedVotesPartyIndependents: 0,
                mostLoyal: [],
                leastLoyal: [],
                mostEngaged: [],
                leastEngaged: []
            }
        }
    },
    created() {
        
        let chamber = tableSenate ? "senate" : "house"
        let endpoint = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`
        let init = { headers: { "X-API-key": "eObmd0hjXfacZmdqvTlfLNE1iyVFB4jp8yxtLqDP" } }
        let estadisticas = this.statistics
        console.log(estadisticas)

        fetch(endpoint, init)
            .then(res => res.json())
            .then(json => {
                this.members = json.results[0].members
                //console.log(this.members)            
                this.membersFilteredByParty()
                this.totalMembersByParty()
                this.totalAverageVotes()
                this.tableLeastLoyalMostEngaged()
                this.tableMostLoyalLeastEngaged()
                this.compareMembers()
            })
            .catch(err => console.error(err.message))
    },


    methods: {
        membersFilteredByParty() {
            this.democrats = this.members.filter(member => member.party === "D")
            this.republicans = this.members.filter(member => member.party === "R")
            this.independents = this.members.filter(member => member.party === "ID")
        },
        totalMembersByParty() {
            this.statistics.democrats = this.democrats.length
            this.statistics.republicans = this.republicans.length
            this.statistics.independents = this.independents.length
        },
        totalAverageVotes() {
            function averageVotes(party, property) {
                let sumAvg = 0
                for (let i = 0; i < party.length; i++) {
                    sumAvg = sumAvg + party[i][property]
                }
                let average = parseFloat((sumAvg / party.length).toFixed(2))

                return average
            }
            this.statistics.avgVotesWithPartyDemocrats = averageVotes(this.democrats, "votes_with_party_pct")
            this.statistics.avgVotesWithPartyRepublicans = averageVotes(this.republicans, "votes_with_party_pct")
            this.statistics.avgVotesWithPartyIndependents = averageVotes(this.independents, "votes_with_party_pct")

            this.statistics.avgMissedVotesPartyDemocrats = averageVotes(this.democrats, "missed_votes_pct")
            this.statistics.avgMissedVotesPartyRepublicans = averageVotes(this.republicans, "missed_votes_pct")
            this.statistics.avgMissedVotesPartyIndependents = averageVotes(this.independents, "missed_votes_pct")

        },
        // 10 PRIMEROS DE MENOS A MAS / MENOS LEAL A MAS LEAL - MENOS MISSED VOTES MAS MISSED VOTES
        tableLeastLoyalMostEngaged() {
            let tenPercent //la declaro global para usarla luego en el slice

            function leastArray(array, property) {
                let orderedArray = array.filter(arr => arr.total_votes > 0)
                    .sort((a, b) => {
                        if (a[property] < b[property]) {
                            return -1
                        } else if (a[property] > b[property]) {
                            return 1
                        }
                        return 0
                    })
                tenPercent = Math.round(orderedArray.length * 10 / 100)
                return orderedArray
            }
            this.statistics.leastLoyal = leastArray(this.members, "votes_with_party_pct").slice(0, (tenPercent))
            // los que tienen menos missed votes - los que no votaron menos veces (mas comprometidos)
            this.statistics.mostEngaged = leastArray(this.members, "missed_votes_pct").slice(0, (tenPercent))

            //COMPARA EL PCT DEL RESTO DE MIEMBROS CON EL ULTIMO
            function compareRestMembers(funct, arrayUno, propiedad, arrayDos) {
                let moreMembers = funct(arrayUno, propiedad).slice(tenPercent)
                for (let i = 0; i < moreMembers.length; i++) {
                    if (moreMembers[i][propiedad] === arrayDos[arrayDos.length - 1][propiedad]) {
                        arrayDos.push(moreMembers[i])
                    }
                }
                return arrayDos
            }
            compareRestMembers(leastArray, this.members, "votes_with_party_pct", this.statistics.leastLoyal)
            compareRestMembers(leastArray, this.members, "missed_votes_pct", this.statistics.mostEngaged)
        },
        //10 PRIMEROS DE MAS A MENOS
        tableMostLoyalLeastEngaged() {
            function mostArray(array, property) {
                let orderedArrayDos = array.filter(arr => arr[property] > 0)
                    .sort((a, b) => {
                        if (a[property] > b[property]) {
                            return -1
                        } else if (a[property] < b[property]) {
                            return 1
                        }
                        return 0
                    })
                tenPercent = Math.round(orderedArrayDos.length * 10 / 100)

                return orderedArrayDos
            }
            this.statistics.mostLoyal = mostArray(this.members, "votes_with_party_pct").slice(0, (tenPercent))
            // los que tienen mas missed votes - los que no votaron mas veces(menos comprometidos)
            this.statistics.leastEngaged = mostArray(this.members, "missed_votes_pct").slice(0, (tenPercent))

          
        },
        compareMembers(){
            function compareRestMembers(funct, arrayUno, propiedad, arrayDos){
                let moreMembers = funct(arrayUno, propiedad).slice(tenPercent)                                             
                 for(let i = 0; i < moreMembers.length; i++){
                   if(moreMembers[i][propiedad] === arrayDos[arrayDos.length-1][propiedad]){          
                       arrayDos.push(moreMembers[i])          
                   }         
                 } 
                 return arrayDos 
            }
        compareRestMembers(tableLeastLoyalMostEngaged, this.members, "votes_with_party_pct", this.statistics.leastLoyal)
        compareRestMembers(tableLeastLoyalMostEngaged, this.members, "missed_votes_pct", this.statistics.mostEngaged)
            
        compareRestMembers(tableMostLoyalLeastEngaged, this.members, "votes_with_party_pct", this.statistics.mostLoyal)
        compareRestMembers(tableMostLoyalLeastEngaged, this.members, "missed_votes_pct", this.statistics.leastEngaged)
            
         },
    },
    computed: {
        membersFiltered() {
            return this.members.filter(member => ((this.party.includes(member.party) && (this.selectedStates.includes(member.state) || this.selectedStates === "all" || this.selectedStates === "")) || ((this.selectedStates.includes(member.state) || this.selectedStates === "all") && this.party.length === 0) || (this.selectedStates === "" && this.party.length === 0)))

        },
        createState() {
            return this.states = new Set(this.members.map(member => member.state))
        },        
    }
});

app.mount("#app")


