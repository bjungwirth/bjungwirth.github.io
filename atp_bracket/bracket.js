function buildtree(teams) {
  var round = 8;
  var gid = 255;

  var root = {
    gid: gid--,
    region: "Q1-Q2-Q3-Q4",
    round: round--,
    children: [],
  };

  var roundgames = {8: [root]};

  // 1-32: Q1; 33-64: Q2; 65-96: Q3; 97-128: Q4
  // 129-144: Q1; 145-160: Q2; 161-176: Q3; 177-192; Q4
  // 193-200: Q1; 201-208: Q2; 209-216: Q3; 217-224: Q4;
  // 225-228: Q1; 229-232: Q2; 233-236: Q3; 237-240: Q4;
  // 241-242: Q1; 243-244: Q2; 245-246: Q3; 247-248: Q4;
  // 249: Q1; 250: Q2; 251: Q3; 252: Q4;
  // 253: Q1-Q2; 254: Q3-Q4;
  // 255: Q1-Q2-Q3-Q4
  function region(gid) {
    if ((gid >= 1 && gid <= 32) || (gid >= 129 && gid <= 144) ||
        (gid >= 193 && gid <= 200) || (gid >= 225 && gid <= 228) ||
        (gid == 241 || gid == 242 || gid == 249)) { return "Q1"; }
    if ((gid >= 33 && gid <= 64) || (gid >= 145 && gid <= 160) ||
        (gid >= 201 && gid <= 208) || (gid >= 229 && gid <= 232) ||
        (gid == 243 || gid == 244 || gid == 250)) { return "Q2"; }
    if ((gid >= 65 && gid <= 96) || (gid >= 161 && gid <= 176) ||
        (gid >= 209 && gid <= 216) || (gid >= 233 && gid <= 236) ||
        (gid == 245 || gid == 246 || gid == 251)) { return "Q3"; }
    if ((gid >= 97 && gid <= 128) || (gid >= 177 && gid <= 192) ||
        (gid >= 217 && gid <= 224) ||  (gid >= 237 && gid <= 240) ||
        (gid == 247 || gid == 248 || gid == 252)) { return "Q4"; }
    if (gid == 253) { return "Q1-Q2"; }
    if (gid == 254) { return "Q3-Q4"; }
    if (gid == 255) { return "Finals"; }

    // raise an error if we fall through
    throw new Error("undefined region for gid " + gid);
  }

  while (round > 0) {
    roundgames[round] = [];
    for (var i=0; i < roundgames[round+1].length; i++) {
      var left = {
        gid: gid,
        region: region(gid),
        round: round,
        children: [],
      };
      gid--;

      var right = {
        gid: gid,
        region: region(gid),
        round: round,
        children: [],
      };
      gid--;

      roundgames[round+1][i].children.push(left);
      roundgames[round+1][i].children.push(right);
      roundgames[round].push(left);
      roundgames[round].push(right);
    }
    round--;
  }

  var r_to_l = ['1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32'];
  var l_to_r = ['32',
  '31',
  '30',
  '29',
  '28',
  '27',
  '26',
  '25',
  '24',
  '23',
  '22',
  '21',
  '20',
  '19',
  '18',
  '17',
  '16',
  '15',
  '14',
  '13',
  '12',
  '11',
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
  '1'];

  var regions = ["Q1", "Q2", "Q3", "Q4"];

  function findgame(gid) {
    var found;

    $.each(roundgames[1], function(i, game) {
      if (game.gid == gid) {
        found = game;
        return false;
      }
    });

    if (!found) throw new Error("Unable to find gid " + gid);

    return found;
  }

  var gid = 1;
  $.each(regions, function(i, region) {
    var order;
    if (region == "Q1" || region == "Q2") { order = r_to_l; }
    else                                       { order = l_to_r; }

    $.each(order, function(j, seed) {
      var game = findgame(gid);
      game.team = teams[region][seed];
      gid++;
    });
  });

  return root;
}

function main(teams) {
  var radius = 600,
      numRounds = 8,
      segmentWidth = radius / (numRounds + 1),
      root = buildtree(teams),
      logoheight = 35;

  var partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, radius]) // x maps to angle, y to radius
    .value(function(d) { return 1; }); //Important!

  var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return d.y; })
    .outerRadius(function(d) { return d.y + d.dy; });

  function trans(x, y) {
    return 'translate('+x+','+y+')';
  }

  function rotate(a, x, y) {
    a = a * 180 / Math.PI;
    return 'rotate('+a+')';
  }

  var xCenter = radius, yCenter = radius;
  var svg = d3.select('#bracket')
              .append('svg')
                .attr('width', radius*2+25)
                .attr('height', radius*2+25)
              .append('g')
                .attr("id", "center")
                .attr('transform', trans(xCenter,yCenter));

  var chart = svg.append('g').attr("id", "chart");
  chart.datum(root).selectAll('.arc')
    .data(partition.nodes)
    .enter()
    .append('g')
      .attr("class", "arc")
      .attr("id", function(d) { return "game" + d.gid; });

  var arcs = d3.selectAll('.arc');

  function clamp(n) {
    if (n>1) { return 1; }
    return n;
  }

  function calcTextcolor(color, alpha) {
    // http://javascriptrules.com/2009/08/05/css-color-brightness-contrast-using-javascript/
    var brightness = color[0]*0.299 + color[1]*0.587 + color[2]*0.114;
    brightness /= alpha;

    if (brightness > 125 || alpha < 0.15) {
      return "#333"; //black
    }
    return "#FFF"; //white
  }

  function rgba(color, alpha) {
    // Very small alpha values mess up webkit
    if (alpha.toString().indexOf("e") > -1) { alpha = 0; }
    return "rgba("+color[0]+","+color[1]+","+color[2]+","+alpha+")";
  }

  var spots = {
/*     245: [65, 185],
    246: [165, 95],
    247: [178, -70],
    249: [-104, -104],
    250: [-104, 104],
    251: [100, 92],
    252: [64, -48], */
    253: [-100,0],
    254: [100,0],
    255: [0,0],
  };
  // 1-32: Q1; 33-64: Q2; 65-96: Q3; 97-128: Q4
  // 129-144: Q1; 145-160: Q2; 161-176: Q3; 177-192; Q4
  // 193-200: Q1; 201-208: Q2; 209-216: Q3; 217-224: Q4;
  // 225-228: Q1; 229-232: Q2; 233-236: Q3; 237-240: Q4;
  // 241-242: Q1; 243-244: Q2; 245-246: Q3; 247-248: Q4;
  // 249: Q1; 250: Q2; 251: Q3; 252: Q4;
  // 253: Q1-Q2; 254: Q3-Q4;
  // 255: Q1-Q2-Q3-Q4
  function fillpath(game) {
    var par = game.parent;
    for (var round=game.round; round < 8; round++) {
      var sr = "round"+round;
      var gameg = d3.select("#game" + par.gid);
      if (gameg.datum().team) { par = par.parent; continue; }

      // color the main path
      var alpha = clamp(game.team[sr]*2);
      var color = rgba(game.team.color, alpha);
      gameg.select("path").style("fill", color);

      var x,y;
      if (spots.hasOwnProperty(par.gid)) {
        x = spots[par.gid][0];
        y = spots[par.gid][1];
      } else {
        var bb = gameg.node().getBBox();
        x = bb.x + bb.width/2;
        y = bb.y + bb.height/2;
      }

      var pct = (game.team[sr] * 100);
      if (pct > 1)      { pct = pct.toFixed(0).toString() + "%"; }
      else if (pct > 0) { pct = "<1%"; }
      else              { pct = ""; }
      gameg.append("text")
          .text(pct)
          .attr("class", "pcttext")
          .attr("fill", calcTextcolor(game.team.color, alpha))
          .attr("text-anchor", "middle")
          .attr("x", x)
          .attr("y", y);
      par = par.parent;
    }

    var teamcolor = calcTextcolor(game.team.color, alpha);
    d3.select("#center")
      .append("text")
      .attr("x", 0)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .style("fill", "#666")
      .attr("id", "teamname")
      .text(game.team.name);

    d3.selectAll("#game255 .logo").style("opacity", "0.1");
  }

  function getLogoColors(game) {
    RGBaster.colors("logos/"+game.team.name+".png", function(payload) {
      var colors = payload.dominant.match(/(\d{1,3}),(\d{1,3}),(\d{1,3})/);

      game.team.color = [colors[1], colors[2], colors[3]];

      fillpath(game);
    });
  }

  function getLeaves(game, leaves) {
    if(leaves===undefined) { leaves=[]; }
    for (g in game.children) {
      if (game.children[g].team !== undefined) { leaves.push(game.children[g]); }
      else { getLeaves(game.children[g], leaves) }
    }
    return leaves;
  }

/*   function getBestBet(game) {
    var teams = getLeaves(game);
    var probs = $.map(teams, function(team) { return team.team["round" + (game.round-1)]; });
    var idx = probs.indexOf(Math.max.apply(null, probs));
    return teams[idx];
  }
 */

  function getBestBet(game) {
    var teams = getLeaves(game);
    var probs = $.map(teams, function(team) { return team.team["round" + (game.round-1)]; });
    var idx = probs.indexOf(Math.max.apply(null, probs));
    return teams[idx];
  }

  function hover(game) {
    var highlightGame;

    // If there's not already a winner, find the most probable winner
    if (!game.team) {
      if (!game.bestBet) {
        game.bestBet = getBestBet(game);
      }
      highlightGame = game.bestBet;
    } else {
      highlightGame = game;
    }

    // If we don't yet know the team's color, parse the logo and save it.
    // Else, just fill the path with the cached value
    if (highlightGame.team.color === undefined) {
      getLogoColors(highlightGame);
    } else {
      fillpath(highlightGame);
    }
  }

  function clear(team) {
    d3.selectAll(".arc path").style("fill", "#fff");
    d3.selectAll(".pcttext").remove();
    d3.selectAll("#teamname").remove();
    d3.selectAll("#game255 .logo").style("opacity", "1");
  }

  arcs.on('mouseenter', function(d) { clear(d); hover(d); })
    .on('mouseleave', function(d) { clear(d); })
    .on('touchstart', function(d) { clear(d); hover(d); })
    .append('path')
      .attr('d', arc)
      .attr("id", function(d) { return "path-game" + d.gid; });

  var multipliers = {
    4: 1.03,
    5: 1.15,
    6: 1.4,
  }

  function logo(d) {
      var bb = d3.select("#game"+d.gid+" path").node().getBBox();
      var x = bb.x + bb.width/2;
      var y = bb.y + bb.height/2;
      if (multipliers.hasOwnProperty(d.round)) {
        var m = multipliers[d.round];
        x *= m;
        y *= m;
      }
      x -= logoheight/2;
      y -= logoheight/2;
      return trans(x, y);
  }

  arcs.append("clipPath")
    .attr("id", function(d) { return "text-clip-game" + d.gid; })
  .append("use")
    .attr("xlink:href", function(d) { return "#path-game" + d.gid; });

  logos = arcs.append('g')
    .attr("class", "logo")
    .attr("clip-path", function(d) { return "url(#text-clip-game"+d.gid+")"; })
    .attr("id", function(d) { return "logo" + d.gid; });

  logos.filter(function(d) {return d.team; })
    .append("image")
    .attr("xlink:href", function(d) { return "logos/"+d.team.name+".png"; })
    .attr("transform", logo)
    .attr("width", logoheight)
    .attr("height", logoheight);

  function clipurl(d)  { return "url(#text-clip-game"+d.gid+")"; }
  function logoname(d) { return "logos/"+d.team.name+".png"; }
  function logoid(d)   { return "logo" + d.gid; }

  for (var i=1; i < 256; i++) {
    var game = d3.select("#game" + i).datum();
    if (game.team && game.team["round" + game.round] == 1) {
      var gid = game.parent.gid;
      var wingame = d3.select("#game" + gid);
      wingame.datum().team = game.team;
      wingame.append('g')
        .attr("class", "logo")
        .attr("clip-path", clipurl)
        .attr("id", logoid)
      .append("image")
        .attr("xlink:href", logoname)
        .attr("transform", logo)
        .attr("width", logoheight)
        .attr("height", logoheight);
    }
  }

  var nradius = radius + 30;
  var arcmaker = d3.svg.arc().innerRadius(nradius).outerRadius(nradius);
  var regionarcs = [
    {region: "Q1", startAngle: 0, endAngle: Math.PI/2},
    {region: "Q2", startAngle: Math.PI/2, endAngle: Math.PI},
    {region: "Q3", startAngle: Math.PI, endAngle: 3*Math.PI/2},
    {region: "Q4", startAngle: 3*Math.PI/2, endAngle: 2*Math.PI}
  ];

  var namearcs = d3.select("#center")
    .append("g")
      .attr("id", "namearcs");

  var namearc = namearcs.selectAll("g")
    .data(regionarcs)
    .enter()
    .append("g")
      .attr("class", "namearc");

  namearc.append("defs").append("path")
      .attr("d", arcmaker)
      .attr("id", function(d) { return "regionpath-" + d.region; })
      .attr("class", "regionpath")
      //.attr("style", "display:none");

  namearc.append("text")
    .append("textPath")
      .attr("text-anchor", "middle")
      .attr("startOffset", "25%")
      .attr("xlink:href", function(d) { return "#regionpath-" + d.region; })
      .style("fill", "#888")
      .style("font-weight", "bold")
      .style("font-size", "36px")
      .text(function(d) { return d.region; });
}

queue()
  .defer(d3.json, 'players.json')
  .await(function(err, teams) { main(teams); });
