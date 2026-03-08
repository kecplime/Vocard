let score = 0
let timer = 7
let countdown = null
let waitingNext = false

let needPassStreak = 0
let gameStarted = false

let playedSongs = new Set()
let playedExtras = new Set()

const grid = document.getElementById("card-grid")
const scoreLabel = document.getElementById("score")
const timerLabel = document.getElementById("timer")
const resultLabel = document.getElementById("result")

const startBtn = document.getElementById("startBtn")
const passBtn = document.getElementById("passBtn")
const nextBtn = document.getElementById("nextBtn")

const tutorial = document.getElementById("tutorial")
const tutorialText = document.getElementById("tutorialText")
const tutorialNext = document.getElementById("tutorialNext")
const skipBtn = document.getElementById("skipBtn")

const player = document.getElementById("player")

startBtn.onclick = startGame
passBtn.onclick = passTurn
nextBtn.onclick = nextRound

tutorialNext.onclick = nextTutorial
skipBtn.onclick = endTutorial


let tutorialSteps = [
"欢迎来到Vocard,也就是Vocaloid歌牌游戏。",
"界面上有16张歌牌。本次选取的歌牌均为神话曲，以保证大家都耳熟能详。",
"在你点击“下一题”或者“开始”后，系统会播放一段音乐。",
"考虑到各位术术人已经对这些曲子再熟悉不过，为了增加挑战性，所以此次选取的片段很短，也不会是大家最熟悉的段落。",
"在音乐播放结束后，你有7秒钟的时间来判断它是否属于这16首歌。如果属于，请抢牌（也就是点击那张歌牌）。如果不属于，请点击过牌。7秒内没有做出回答视为过牌。",
"抢牌成功得一分，过牌成功不加分，抢牌过牌失败都扣一分。",
"看看你对这些曲子的熟悉程度如何吧！"
]

let tutorialIndex = 0
tutorialText.innerText = tutorialSteps[0]


function nextTutorial(){

tutorialIndex++

if(tutorialIndex >= tutorialSteps.length){
endTutorial()
return
}

tutorialText.innerText = tutorialSteps[tutorialIndex]

}

function endTutorial(){
tutorial.style.display = "none"
}


let songs = [
{
name: "把你给MikuMiku掉",
cover: "cover/mikumiku.jpg",
audio: "audio/mikumiku.m4a"
},
{
name: "lost one的号哭",
cover: "cover/lost one.jpg",
audio: "audio/lost one.m4a"
},
{
name: "melt",
cover: "cover/melt.jpg",
audio: "audio/melt.m4a"
},
{
name: "roki",
cover: "cover/roki.jpg",
audio: "audio/roki.m4a"
},
{
name: "俄罗斯套娃",
cover: "cover/俄罗斯套娃.jpg",
audio: "audio/俄罗斯套娃.m4a"
},
{
name: "海百合海底谭",
cover: "cover/海百合海底谭.jpg",
audio: "audio/海百合海底谭.m4a"
},
{
name: "里表情人",
cover: "cover/里表情人.jpg",
audio: "audio/里表情人.m4a"
},
{
name: "六兆年零一夜物语",
cover: "cover/六兆年零一夜物语.jpg",
audio: "audio/六兆年零一夜物语.m4a"
},
{
name: "炉心融解",
cover: "cover/炉心融解.jpg",
audio: "audio/炉心融解.m4a"
},
{
name: "罗密欧与辛德瑞拉",
cover: "cover/罗密欧与辛德瑞拉.jpg",
audio: "audio/罗密欧与辛德瑞拉.m4a"
},
{
name: "马赛克卷",
cover: "cover/马赛克卷.jpg",
audio: "audio/马赛克卷.m4a"
},
{
name: "脑浆炸裂女孩",
cover: "cover/脑浆炸裂女孩.jpg",
audio: "audio/脑浆炸裂女孩.m4a"
},
{
name: "千本樱",
cover: "cover/千本樱.jpg",
audio: "audio/千本樱.m4a"
},
{
name: "明日的夜空哨戒班",
cover: "cover/明日的夜空哨戒班.jpg",
audio: "audio/明日的夜空哨戒班.m4a"
},
{
name: "天之弱",
cover: "cover/天之弱.jpg",
audio: "audio/天之弱.m4a"
},
{
name: "初音未来的消失",
cover: "cover/初音未来的消失.jpg",
audio: "audio/初音未来的消失.m4a"
}
]


let extras = [
{
    name:"少女灵",
    audio:"extra/少女灵.m4a"
},
{
    name:"freely tomorrow",
    audio:"extra/freely tomorrow.m4a"
},      
{
    name:"rolling girl",
    audio:"extra/rolling girl.m4a"
},     
{
    name:"tell your world",
    audio:"extra/tell your world.m4a"
},     
{
    name:"活动小丑",
    audio:"extra/活动小丑.m4a"
},     
{
    name:"随神之侧",
    audio:"extra/随神之侧.m4a"
},     
]

let removed = new Set()
let currentSong = null


function init(){

songs.forEach((song,i)=>{

const card = document.createElement("div")
card.className = "card"

card.innerHTML = `
<img src="${song.cover}">
<div class="song-name">${song.name}</div>
`

card.onclick = () => chooseSong(i)

grid.appendChild(card)

})

}


function startGame(){

gameStarted = true

startBtn.style.display = "none"
passBtn.style.display = "inline"

nextRound()

}


function nextRound(){

    if(removed.size === songs.length){
    alert("Game Over. Score: "+score)
    return
    }
    
    waitingNext = false
    nextBtn.style.display = "none"
    resultLabel.innerText = ""
    
    selectSong()
    
    // 重置倒计时显示
    timer = 7
    timerLabel.innerText = "Time: "+timer
    
    if(typeof currentSong === "number"){
    player.src = songs[currentSong].audio
    }else{
    player.src = currentSong.audio
    }
    
    player.currentTime = 0
    player.play()
    
    player.onended = () => {
    startTimer()
    }
    
    }


    function selectSong(){

        if(playedExtras.size === extras.length){
            playedExtras.clear()
            }

        let boardIndexes = songs
        .map((s,i)=>i)
        .filter(i=>!removed.has(i))
        
        let mustInside = (needPassStreak >= 2)
        
        let pool
        
        if(mustInside){
        
        pool = boardIndexes
        
        }else{
        
            let extraPool = extras.filter(e => !playedExtras.has(e.name))

            pool = [...boardIndexes,...extraPool]
        
        }
        
        currentSong = pool[Math.floor(Math.random()*pool.length)]
        if(typeof currentSong !== "number"){
            playedExtras.add(currentSong.name)
            }
        
        if(typeof currentSong === "number"){
        needPassStreak = 0
        }else{
        needPassStreak++
        }
        
        }

function startTimer(){

timer = 7
timerLabel.innerText = "Time: "+timer

clearInterval(countdown)

countdown = setInterval(()=>{

timer--
timerLabel.innerText = "Time: "+timer

if(timer <= 0){

clearInterval(countdown)
passTurn()

}

},1000)

}


function chooseSong(index){

    if(!gameStarted) return
    if(waitingNext) return
    if(removed.has(index)) return
    
    clearInterval(countdown)
    
    const inBoard = typeof currentSong === "number"
    const chosen = songs[index]
    
    if(inBoard){
    
    if(index === currentSong){
    
    score++
    resultLabel.innerText="恭喜你，做出了正确的选择。"
    removeCard(index)
    
    }else{
    
    score--
    resultLabel.innerText="很遗憾，你做出了错误的选择。"
    removeCard(currentSong)
    
    }
    
    }else{
    
    score--
    resultLabel.innerText="很遗憾，你做出了错误的选择。"
    
    }
    
    updateScore()
    
    waitingNext = true
    nextBtn.style.display = "inline"
    
    }
    function passTurn(){

        if(!gameStarted) return
        if(waitingNext) return
        
        clearInterval(countdown)
        
        const inBoard = typeof currentSong === "number"
        
        if(inBoard){
        
        score--
        resultLabel.innerText="很遗憾，你做出了错误的选择。"
        removeCard(currentSong)
        
        }else{
        
        resultLabel.innerText="恭喜你，做出了正确的选择。"
        
        }
        
        updateScore()
        
        waitingNext = true
        nextBtn.style.display = "inline"
        
        }

function removeCard(index){

removed.add(index)
grid.children[index].classList.add("removed")

}


function removeRandom(){

let candidates = []

songs.forEach((s,i)=>{
if(!removed.has(i)) candidates.push(i)
})

if(candidates.length === 0) return

let index = candidates[Math.floor(Math.random()*candidates.length)]

removeCard(index)

}


function updateScore(){

scoreLabel.innerText = "Score: "+score

}

init()