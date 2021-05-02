<template>
<div class="container sweeper text-center mt-5">
  <h1 class="text-success">Mine Sweeper</h1><br>
  <div class="row w-50 mx-auto">
    <div class="col"
         :class="{'text-muted': running}">
      Select number of mines:
      <div class="h3">{{minesTotal}}
        <small class="h6">(tagged: {{minesTagged}})</small>
      </div>
      <PlusIcon class="custom-class mx-2"
                :class="{'pointer': !running}"
                size="0.7x"
                @click="incrementMines()"></PlusIcon>
      <MinusIcon class="custom-class"
                 :class="{'pointer': !running}"
                 size="0.7x"
                 @click="decrementMines()"></MinusIcon>
    </div>
    <div class="col">
      <template v-if="!running">
        <button class="btn btn-success btn-sm w-50 mx-auto mt-4 p-3"
                @click="start()">Start</button>
      </template>
      <template v-if="running">
        <button class="btn btn-danger btn-sm w-50 mx-auto mt-4 p-3"
                @click="stop()">Stop</button>
      </template>
      <template v-if="isOver">
        <button class="btn btn-warning btn-sm w-50 mx-auto mt-4 p-3"
                @click="start()">Restart</button>
      </template>
    </div>
    <div class="col-12">
      Timer: {{timer | time}}
    </div>
  </div>

  <div class="minefield mt-4" @contextmenu.capture.prevent>
    <template v-for="(row,rowIndex) in minefield.array">
      <div class="row"
           :key="rowIndex">
        <template v-for="(field,colIndex) in row">
          <div class="mine-box text-dark pointer"
               :class="[(field.flagged ? 'bg-warning' : ''),
                        (field.mined && field.opened ? 'bg-danger' : ''),
                        (field.opened ? 'bg-secondary' : '')]"
               @contextmenu="flag(rowIndex, colIndex)"
               @click="check(field, true)"
               :key="colIndex">
            {{field.value}}
          </div>
        </template>
      </div>
    </template>
  </div>


  <!-- MODALs -->
  <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">vMineSweeper</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          Yaay!
        </div>
      </div>
    </div>
  </div>

</div>
</template>

<script>
import {
  PlusIcon,
  MinusIcon
} from 'vue-feather-icons'

export default {
  name: 'Sweeper',
  components: {
    PlusIcon,
    MinusIcon
  },
  data() {
    return {
      minesTotal: 10,
      minesTagged: 0,
      running: false,
      isOver: false,
      mineTag: 'M',
      minefield: {
        size: {
          width: 10,
          height: 10
        },
        array: []
      },
      timer: 300, // seconds
      timeout: null
    }
  },
  methods: {
    start() {
      this.isOver = false
      this.initField(this.minefield.size.width, this.minefield.size.height)
      this.plantMines()
      this.countDownTimer()
      this.running = true
    },
    stop() {
      this.isOver = false
      this.running = false
      this.minesTagged = 0
      this.clearTimer()
      this.minefield.array = []
    },
    clearTimer(){
      clearTimeout(this.timeout)
      this.timer = 300
    },
    plantMines(){
      let planted = 0
      while(planted < this.minesTotal){
        let x = Math.floor(Math.random() * 10)
        let y = Math.floor(Math.random() * 10)
        if(this.minefield.array[x][y].mined == false) {
          this.minefield.array[x][y].mined = true
          planted++
        }
      }
    },
    initField(w, h){
      this.minefield.array = new Array(w).fill(0).map((row, rowIndex) => {
        return new Array(h).fill(0).map((col, colIndex) => {
          return {
                  row: rowIndex,
                  col: colIndex,
                  value: null,
                  opened: false,
                  flagged: false,
                  mined: false
                }
        })
      })
    },
    check(field, recursive=false){
      if(!field.opened && !this.isOver){

          field.opened = true
          let noMinesAround = false

          if(this.checkWin()) this.gameWin()

          if(field.mined) this.gameOver()

          let neighbors = this.getNeighbors(field)
          let minedNeighbors = this.getMinedNeighbors(neighbors)

          if(minedNeighbors > 0){
             field.value = minedNeighbors
          }else {
            noMinesAround = true
          }

          if(noMinesAround && recursive){
             neighbors.forEach((neighbor) => {
               setTimeout(() => {
                 this.check(neighbor, true)
               }, 50)
             })
          }

      }
    },
    getNeighbors(field){
      let neighbors = []
      const surrounding = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]

      surrounding.forEach((position) => {
        let row = field.row + position[0]
        let col = field.col + position[1]
        if(this.fieldExists(row, col)) neighbors.push(this.fieldExists(row,col))
      })
      return neighbors
    },
    getMinedNeighbors(fields){
      let mines = 0
      fields.forEach((field) => {
        if(field.mined) mines++
      })
      return mines
    },
    fieldExists(x, y) {
      if(x >= 0 && x < this.minefield.size.width && y >= 0 && y < this.minefield.size.height){
        return this.minefield.array[x][y]
      }

    },
    countDownTimer() {
        if(this.timer > 0) {
            this.timeout = setTimeout(() => {
                              this.timer -= 1
                              this.countDownTimer()
                          }, 1000)
        }
    },
    flag(x,y){
      if(this.minefield.array[x][y].flagged) this.minesTagged--
      if(!this.minefield.array[x][y].flagged) this.minesTagged++
      this.minefield.array[x][y].flagged = !this.minefield.array[x][y].flagged
    },
    decrementMines() {
      if (!this.running) {
        if (this.minesTotal === 5) return alert("There has to be something :) 5 is the minimum")
        this.minesTotal--
      }
    },
    incrementMines() {
      if (!this.running) {
        if (this.minesTotal === 30) return alert("Don't be too hard on yourself :)")
        this.minesTotal++
      }
    },
    checkWin() {
      let win = true
      this.minefield.array.forEach((row) => {
        row.forEach((field) => {
           if(!field.mined && !field.opened) {
             win = false
           }
        })
      })
      return win
    },
    gameWin() {
      this.isOver = true
      this.clearTimer()
      alert("Congratulations!")
    },
    gameOver() {
      this.isOver = true
      this.clearTimer()
      //showMines
      this.minefield.array.forEach((row) => {
        row.forEach((field) => {
           if(field.mined) {
             field.opened = true
             field.value = 'M'
           }
        })
      })

      alert("Ouch, you just died :(")
    }
  }
}
</script>

<style scoped>
.sweeper {
  width: 80vw;
  height: 100vh;
  margin: 0 auto;
}
.minefield {
  display: grid;
  justify-content: center;
}
.mine-box {
  width: 45px;
  height: 45px;
  padding: 0;
  margin: 0;
  border: 1px solid #4f4f4f;
  background: #198754;
  transition: 0.1s;
  padding-top: 10px;
  font-size: 0.8rem;
}
.mine-box:hover {
  opacity: 0.5;
}
</style>
