let counter = 1;
let lastUpdate = 1;
let numPitch = 1;
let targetPitch = 200;
let pitchData = [];
let pitchHistories = [];
var freq_mode = [];
var ranges = 20;
var w, h, y, x, chart;

function start() {
  microphonePitch.start((error) => {
    document.getElementById('status').innerHTML = error ? error : 'Input started.';
  });
  freq_mode = [];
  for (var i = 0; i < ranges; i++){
    // f(range - 1) == 2*targetPitch
    // f(0) == targetPitch/2;
    let curr_pitch = (targetPitch/2) + (i/(ranges-1) * targetPitch * 3/2);
    freq_mode.push({key: curr_pitch, value:0});
  }
  w=20;
  h=80;
  x = d3.scaleLinear().domain([0,1]).range([0,w]);
  y = d3.scaleLinear().domain([0,d3.max(freq_mode, function(d){ return d.value; })]).range([10, h]);
  chart = d3.select("body").append("svg:svg")
                .attr("class", "chart")
                .attr("width", w * (ranges -1))
                .attr("height", h);
  chart.selectAll("rect")
    .data(freq_mode)
    .enter().append("svg:rect")
    .attr("x", function(d, i) {return x(i);})
    .attr("y", function(d){ return h - y(d.value);} )
    .attr("width", w)
    .attr("height", function(d) {return y(d.value) - 10;});
    console.log("hello");
  chart.selectAll("text")
    .data(freq_mode)
    .enter().append("svg:text")
    .attr("x", function(d, i){return x(i);})
    .attr("y", h )
    .text(function(d){return Math.round(d.key).toString();})
    .attr("font-size", "8px");
}

function changeNumPitchDataPoints(value) {
  numPitch = value;
}

function changeTargetPitch(value) {
  targetPitch = value;
}

setInterval(() => counter += 1);

microphonePitch.onPitchChange((pitch) => {
  if (pitch !== -1 && pitch < 400) {
    if (pitchData.length < numPitch) {
      console.log(numPitch);
      pitchData.push(parseInt(pitch));
      //pitchHistories.push({time: counter, pitch: pitch})
    } else {
      pitchData.shift();
      pitchData.push(parseInt(pitch));
    }

    if (lastUpdate !== counter) {
      let sum = 0;
      pitchData.forEach(datum => sum += datum);
      const averagePitch = sum / pitchData.length;

      for(let i = 0, found = false; i < ranges; i++){
        if (pitch > freq_mode[ranges-1].key && !found){
          freq_mode[ranges-1].value += 1;
          found = true;
        }
        if (!found && pitch < freq_mode[0].key || pitch > freq_mode[i].key && pitch < freq_mode[i+1].key){
          freq_mode[i].value += 1;
          found = true;
        }
      }
      y = d3.scaleLinear().domain([0,d3.max(freq_mode, function(d){ return d.value; })]).range([10, h]);
      chart.selectAll("rect")
          .data(freq_mode)
          .transition()
          .duration(1)
          .attr("y", function(d){ return h - y(d.value);})
          .attr("height", function(d){ return y(d.value) -10;});
          
      document.getElementById('pitch').innerHTML = `${Math.floor(averagePitch).toString()}`;
      // FIXME: this assumes all trans people want to speak at a higher pitch, always
      // BUT WHAT ABOUT THE MEN!?
      if (targetPitch > pitch) {
        document.getElementById('feedback').innerHTML = 'GO HIGHER!!!!';
      } else if (targetPitch < pitch + 30) {
        document.getElementById('feedback').innerHTML = 'Good';
      } else {
        // i dearly hope greg proops never sees these exclaimation points
        document.getElementById('feedback').innerHTML = "Too high!!!!";
      }
      document.getElementById('status').innerHTML = "hearing";
      // TODO plot history
      // TODO mode bars
      lastUpdate = counter;
    }
  }
  else{
        document.getElementById('status').innerHTML = "silence";
  }
});

document.addEventListener('DOMContentLoaded', () => start());