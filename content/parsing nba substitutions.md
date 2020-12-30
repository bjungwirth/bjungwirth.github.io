title:  Parsing NBA Substitutions in Play-by-Play Data
date: 2020-12-29
category: Data Science
authors: Blaine

Parsing substitutions in basketball play-by-play data is a problem that has eluded me for a while. It's massively important when considering lineup-contextual events or statistics like plus/minus or for parsing rotation data. The below is the approach I came up with to parse this data out and get an idea of which lineups were on the court together and for how long. The best way I have figured to do it was using python classes to store lineup and player data and just change an on/off court value as they were subbed in and out. I am sure there are more elegant ways to handle this data, but I am not a computer scientist!

First we need the box score to get the player rosters for the game we want to parse. In this example I'm going to use Blazers/Nuggets Game 7 from 2019, not that I'm biased at all in choosing one of the best wins for my Blazers in my lifetime.


```python
import requests
import json
import pandas as pd
import re
import numpy as np
import os
import datetime as dt

box_url = 'https://stats.nba.com/stats/boxscoretraditionalv2?EndPeriod=10&EndRange=28800&GameID=0041800237&RangeType=0&Season=2018-19&SeasonType=Playoffs&StartPeriod=1&StartRange=0'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64)', 'x-nba-stats-origin': 'stats', 'x-nba-stats-token': 'true', 'Host':'stats.nba.com', 'Referer':'https://stats.nba.com/game/0021900306/'}
r= requests.get(box_url, headers=headers, timeout = 5)
data = json.loads(r.text)
box = pd.DataFrame.from_dict(data['resultSets'][0]['rowSet'])
col_names = data['resultSets'][0]['headers']
box.columns = col_names
box.columns = box.columns.str.lower()
box

```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>game_id</th>
      <th>team_id</th>
      <th>team_abbreviation</th>
      <th>team_city</th>
      <th>player_id</th>
      <th>player_name</th>
      <th>start_position</th>
      <th>comment</th>
      <th>min</th>
      <th>fgm</th>
      <th>fga</th>
      <th>fg_pct</th>
      <th>fg3m</th>
      <th>fg3a</th>
      <th>fg3_pct</th>
      <th>ftm</th>
      <th>fta</th>
      <th>ft_pct</th>
      <th>oreb</th>
      <th>dreb</th>
      <th>reb</th>
      <th>ast</th>
      <th>stl</th>
      <th>blk</th>
      <th>to</th>
      <th>pf</th>
      <th>pts</th>
      <th>plus_minus</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>203090</td>
      <td>Maurice Harkless</td>
      <td>F</td>
      <td></td>
      <td>16:47</td>
      <td>3.0</td>
      <td>5.0</td>
      <td>0.600</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.000</td>
      <td>3.0</td>
      <td>2.0</td>
      <td>5.0</td>
      <td>3.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>5.0</td>
      <td>6.0</td>
      <td>-8.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>202329</td>
      <td>Al-Farouq Aminu</td>
      <td>F</td>
      <td></td>
      <td>7:08</td>
      <td>1.0</td>
      <td>4.0</td>
      <td>0.250</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.000</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>0.500</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>3.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>-7.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>202683</td>
      <td>Enes Kanter</td>
      <td>C</td>
      <td></td>
      <td>39:39</td>
      <td>6.0</td>
      <td>13.0</td>
      <td>0.462</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>4.0</td>
      <td>8.0</td>
      <td>12.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>12.0</td>
      <td>1.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>203468</td>
      <td>CJ McCollum</td>
      <td>G</td>
      <td></td>
      <td>45:17</td>
      <td>17.0</td>
      <td>29.0</td>
      <td>0.586</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>0.333</td>
      <td>2.0</td>
      <td>2.0</td>
      <td>1.000</td>
      <td>1.0</td>
      <td>8.0</td>
      <td>9.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>37.0</td>
      <td>6.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>203081</td>
      <td>Damian Lillard</td>
      <td>G</td>
      <td></td>
      <td>45:25</td>
      <td>3.0</td>
      <td>17.0</td>
      <td>0.176</td>
      <td>2.0</td>
      <td>9.0</td>
      <td>0.222</td>
      <td>5.0</td>
      <td>6.0</td>
      <td>0.833</td>
      <td>0.0</td>
      <td>10.0</td>
      <td>10.0</td>
      <td>8.0</td>
      <td>3.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>13.0</td>
      <td>8.0</td>
    </tr>
    <tr>
      <th>5</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>1628380</td>
      <td>Zach Collins</td>
      <td></td>
      <td></td>
      <td>23:17</td>
      <td>2.0</td>
      <td>6.0</td>
      <td>0.333</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>0.333</td>
      <td>2.0</td>
      <td>2.0</td>
      <td>1.000</td>
      <td>2.0</td>
      <td>4.0</td>
      <td>6.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>4.0</td>
      <td>1.0</td>
      <td>5.0</td>
      <td>7.0</td>
      <td>5.0</td>
    </tr>
    <tr>
      <th>6</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>203918</td>
      <td>Rodney Hood</td>
      <td></td>
      <td></td>
      <td>20:11</td>
      <td>2.0</td>
      <td>6.0</td>
      <td>0.333</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>0.000</td>
      <td>2.0</td>
      <td>2.0</td>
      <td>1.000</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>3.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>6.0</td>
      <td>-2.0</td>
    </tr>
    <tr>
      <th>7</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>203552</td>
      <td>Seth Curry</td>
      <td></td>
      <td></td>
      <td>16:20</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>5.0</td>
      <td>0.0</td>
      <td>7.0</td>
    </tr>
    <tr>
      <th>8</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>202323</td>
      <td>Evan Turner</td>
      <td></td>
      <td></td>
      <td>19:12</td>
      <td>3.0</td>
      <td>7.0</td>
      <td>0.429</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>8.0</td>
      <td>9.0</td>
      <td>0.889</td>
      <td>2.0</td>
      <td>5.0</td>
      <td>7.0</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>4.0</td>
      <td>14.0</td>
      <td>1.0</td>
    </tr>
    <tr>
      <th>9</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>203086</td>
      <td>Meyers Leonard</td>
      <td></td>
      <td></td>
      <td>6:44</td>
      <td>1.0</td>
      <td>4.0</td>
      <td>0.250</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>2.0</td>
      <td>9.0</td>
    </tr>
    <tr>
      <th>10</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>1627746</td>
      <td>Skal Labissiere</td>
      <td></td>
      <td>DNP - Coach's Decision</td>
      <td>None</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>11</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>1627774</td>
      <td>Jake Layman</td>
      <td></td>
      <td>DNP - Coach's Decision</td>
      <td>None</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>12</th>
      <td>0041800237</td>
      <td>1610612757</td>
      <td>POR</td>
      <td>Portland</td>
      <td>1629014</td>
      <td>Anfernee Simons</td>
      <td></td>
      <td>DNP - Coach's Decision</td>
      <td>None</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>13</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>1628470</td>
      <td>Torrey Craig</td>
      <td>F</td>
      <td></td>
      <td>33:01</td>
      <td>2.0</td>
      <td>5.0</td>
      <td>0.400</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.000</td>
      <td>4.0</td>
      <td>5.0</td>
      <td>0.800</td>
      <td>4.0</td>
      <td>4.0</td>
      <td>8.0</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>8.0</td>
      <td>6.0</td>
    </tr>
    <tr>
      <th>14</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>200794</td>
      <td>Paul Millsap</td>
      <td>F</td>
      <td></td>
      <td>31:55</td>
      <td>3.0</td>
      <td>13.0</td>
      <td>0.231</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.000</td>
      <td>4.0</td>
      <td>6.0</td>
      <td>0.667</td>
      <td>1.0</td>
      <td>6.0</td>
      <td>7.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>0.0</td>
      <td>6.0</td>
      <td>10.0</td>
      <td>3.0</td>
    </tr>
    <tr>
      <th>15</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>203999</td>
      <td>Nikola Jokic</td>
      <td>C</td>
      <td></td>
      <td>41:53</td>
      <td>11.0</td>
      <td>26.0</td>
      <td>0.423</td>
      <td>2.0</td>
      <td>6.0</td>
      <td>0.333</td>
      <td>5.0</td>
      <td>7.0</td>
      <td>0.714</td>
      <td>4.0</td>
      <td>9.0</td>
      <td>13.0</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>4.0</td>
      <td>2.0</td>
      <td>3.0</td>
      <td>29.0</td>
      <td>-1.0</td>
    </tr>
    <tr>
      <th>16</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>203914</td>
      <td>Gary Harris</td>
      <td>G</td>
      <td></td>
      <td>39:10</td>
      <td>7.0</td>
      <td>11.0</td>
      <td>0.636</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.000</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>0.500</td>
      <td>0.0</td>
      <td>6.0</td>
      <td>6.0</td>
      <td>3.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>15.0</td>
      <td>-7.0</td>
    </tr>
    <tr>
      <th>17</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>1627750</td>
      <td>Jamal Murray</td>
      <td>G</td>
      <td></td>
      <td>37:53</td>
      <td>4.0</td>
      <td>18.0</td>
      <td>0.222</td>
      <td>0.0</td>
      <td>4.0</td>
      <td>0.000</td>
      <td>9.0</td>
      <td>9.0</td>
      <td>1.000</td>
      <td>2.0</td>
      <td>4.0</td>
      <td>6.0</td>
      <td>5.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>17.0</td>
      <td>-2.0</td>
    </tr>
    <tr>
      <th>18</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>203486</td>
      <td>Mason Plumlee</td>
      <td></td>
      <td></td>
      <td>18:48</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>0.333</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>2.0</td>
      <td>5.0</td>
      <td>0.400</td>
      <td>1.0</td>
      <td>5.0</td>
      <td>6.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>4.0</td>
      <td>-7.0</td>
    </tr>
    <tr>
      <th>19</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>203115</td>
      <td>Will Barton</td>
      <td></td>
      <td></td>
      <td>19:58</td>
      <td>4.0</td>
      <td>9.0</td>
      <td>0.444</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>3.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>8.0</td>
      <td>-9.0</td>
    </tr>
    <tr>
      <th>20</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>1627736</td>
      <td>Malik Beasley</td>
      <td></td>
      <td></td>
      <td>7:15</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>-1.0</td>
    </tr>
    <tr>
      <th>21</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>1628420</td>
      <td>Monte Morris</td>
      <td></td>
      <td></td>
      <td>10:07</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>0.333</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.000</td>
      <td>3.0</td>
      <td>5.0</td>
      <td>0.600</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>5.0</td>
      <td>-2.0</td>
    </tr>
    <tr>
      <th>22</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>1627823</td>
      <td>Juancho Hernangomez</td>
      <td></td>
      <td>DNP - Coach's Decision</td>
      <td>None</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>23</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>1626168</td>
      <td>Trey Lyles</td>
      <td></td>
      <td>DNP - Coach's Decision</td>
      <td>None</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>24</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>202738</td>
      <td>Isaiah Thomas</td>
      <td></td>
      <td>DNP - Coach's Decision</td>
      <td>None</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>25</th>
      <td>0041800237</td>
      <td>1610612743</td>
      <td>DEN</td>
      <td>Denver</td>
      <td>1629020</td>
      <td>Jarred Vanderbilt</td>
      <td></td>
      <td>DNP - Coach's Decision</td>
      <td>None</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>



Filtering to get the starters


```python
starters = box[box['start_position']!= '']
starters = starters[['team_id','team_abbreviation','player_id','player_name','start_position']]
starters
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>team_id</th>
      <th>team_abbreviation</th>
      <th>player_id</th>
      <th>player_name</th>
      <th>start_position</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1610612757</td>
      <td>POR</td>
      <td>203090</td>
      <td>Maurice Harkless</td>
      <td>F</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1610612757</td>
      <td>POR</td>
      <td>202329</td>
      <td>Al-Farouq Aminu</td>
      <td>F</td>
    </tr>
    <tr>
      <th>2</th>
      <td>1610612757</td>
      <td>POR</td>
      <td>202683</td>
      <td>Enes Kanter</td>
      <td>C</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1610612757</td>
      <td>POR</td>
      <td>203468</td>
      <td>CJ McCollum</td>
      <td>G</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1610612757</td>
      <td>POR</td>
      <td>203081</td>
      <td>Damian Lillard</td>
      <td>G</td>
    </tr>
    <tr>
      <th>13</th>
      <td>1610612743</td>
      <td>DEN</td>
      <td>1628470</td>
      <td>Torrey Craig</td>
      <td>F</td>
    </tr>
    <tr>
      <th>14</th>
      <td>1610612743</td>
      <td>DEN</td>
      <td>200794</td>
      <td>Paul Millsap</td>
      <td>F</td>
    </tr>
    <tr>
      <th>15</th>
      <td>1610612743</td>
      <td>DEN</td>
      <td>203999</td>
      <td>Nikola Jokic</td>
      <td>C</td>
    </tr>
    <tr>
      <th>16</th>
      <td>1610612743</td>
      <td>DEN</td>
      <td>203914</td>
      <td>Gary Harris</td>
      <td>G</td>
    </tr>
    <tr>
      <th>17</th>
      <td>1610612743</td>
      <td>DEN</td>
      <td>1627750</td>
      <td>Jamal Murray</td>
      <td>G</td>
    </tr>
  </tbody>
</table>
</div>



Now pulling play by play data and some helper stuff to convert time strings to integers:


```python
pbp_url = 'https://stats.nba.com/stats/playbyplayv2?EndPeriod=10&EndRange=55800&GameID=0041800237&RangeType=2&Season=2018-19&SeasonType=Playoffs&StartPeriod=1&StartRange=0'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64)', 'x-nba-stats-origin': 'stats', 'x-nba-stats-token': 'true', 'Host':'stats.nba.com', 'Referer':'https://stats.nba.com/game/0021900306/'}
r= requests.get(pbp_url, headers=headers, timeout = 5)
data = json.loads(r.text)
pbp = pd.DataFrame.from_dict(data['resultSets'][0]['rowSet'])
col_names = data['resultSets'][0]['headers']
pbp.columns = col_names
pbp.columns = pbp.columns.str.lower()
pbp_times = pbp['pctimestring'].str.split(':',2, expand=True)
pbp_times[0] = pbp_times[0].astype(str).astype(int)
pbp_times[1] = pbp_times[1].astype(str).astype(int)
pbp['timeinseconds'] = (pbp_times[0]*60) + pbp_times[1]
pbp['play_elapsed_time'] = pbp['timeinseconds'].shift(1)  - pbp['timeinseconds'] 
pbp['play_elapsed_time'] = pbp['play_elapsed_time'].fillna(0)
pbp['play_elapsed_time'] = np.where(pbp['period'] != pbp['period'].shift(1), 0, pbp['play_elapsed_time'])
pbp['total_elapsed_time'] = pbp.groupby(['game_id'])['play_elapsed_time'].cumsum()
pbp['max_time'] = pbp.groupby('game_id')['play_elapsed_time'].transform('sum')
pbp['time_remaining'] = pbp['max_time'] - pbp['total_elapsed_time']
pbp['scoremargin'] = np.where(pbp['scoremargin']=='TIE',0,pbp['scoremargin'])
pbp['scoremargin'] = pbp['scoremargin'].fillna(0).astype(int)
pbp.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>game_id</th>
      <th>eventnum</th>
      <th>eventmsgtype</th>
      <th>eventmsgactiontype</th>
      <th>period</th>
      <th>wctimestring</th>
      <th>pctimestring</th>
      <th>homedescription</th>
      <th>neutraldescription</th>
      <th>visitordescription</th>
      <th>score</th>
      <th>scoremargin</th>
      <th>person1type</th>
      <th>player1_id</th>
      <th>player1_name</th>
      <th>player1_team_id</th>
      <th>player1_team_city</th>
      <th>player1_team_nickname</th>
      <th>player1_team_abbreviation</th>
      <th>person2type</th>
      <th>player2_id</th>
      <th>player2_name</th>
      <th>player2_team_id</th>
      <th>player2_team_city</th>
      <th>player2_team_nickname</th>
      <th>player2_team_abbreviation</th>
      <th>person3type</th>
      <th>player3_id</th>
      <th>player3_name</th>
      <th>player3_team_id</th>
      <th>player3_team_city</th>
      <th>player3_team_nickname</th>
      <th>player3_team_abbreviation</th>
      <th>video_available_flag</th>
      <th>timeinseconds</th>
      <th>play_elapsed_time</th>
      <th>total_elapsed_time</th>
      <th>max_time</th>
      <th>time_remaining</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0041800237</td>
      <td>2</td>
      <td>12</td>
      <td>0</td>
      <td>1</td>
      <td>3:41 PM</td>
      <td>12:00</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>None</td>
      <td>NaN</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>0</td>
      <td>0</td>
      <td>None</td>
      <td>NaN</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>0</td>
      <td>0</td>
      <td>None</td>
      <td>NaN</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>0</td>
      <td>720</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2880.0</td>
      <td>2880.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0041800237</td>
      <td>4</td>
      <td>10</td>
      <td>0</td>
      <td>1</td>
      <td>3:41 PM</td>
      <td>12:00</td>
      <td>Jump Ball Millsap vs. Kanter: Tip to Harkless</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>0</td>
      <td>4</td>
      <td>200794</td>
      <td>Paul Millsap</td>
      <td>1.610613e+09</td>
      <td>Denver</td>
      <td>Nuggets</td>
      <td>DEN</td>
      <td>5</td>
      <td>202683</td>
      <td>Enes Kanter</td>
      <td>1.610613e+09</td>
      <td>Portland</td>
      <td>Trail Blazers</td>
      <td>POR</td>
      <td>5</td>
      <td>203090</td>
      <td>Maurice Harkless</td>
      <td>1.610613e+09</td>
      <td>Portland</td>
      <td>Trail Blazers</td>
      <td>POR</td>
      <td>1</td>
      <td>720</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2880.0</td>
      <td>2880.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0041800237</td>
      <td>7</td>
      <td>6</td>
      <td>26</td>
      <td>1</td>
      <td>3:41 PM</td>
      <td>11:45</td>
      <td>None</td>
      <td>None</td>
      <td>Aminu Offensive Charge Foul (P1.T1) (J.Goble)</td>
      <td>None</td>
      <td>0</td>
      <td>5</td>
      <td>202329</td>
      <td>Al-Farouq Aminu</td>
      <td>1.610613e+09</td>
      <td>Portland</td>
      <td>Trail Blazers</td>
      <td>POR</td>
      <td>4</td>
      <td>200794</td>
      <td>Paul Millsap</td>
      <td>1.610613e+09</td>
      <td>Denver</td>
      <td>Nuggets</td>
      <td>DEN</td>
      <td>1</td>
      <td>0</td>
      <td>None</td>
      <td>NaN</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>1</td>
      <td>705</td>
      <td>15.0</td>
      <td>15.0</td>
      <td>2880.0</td>
      <td>2865.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0041800237</td>
      <td>9</td>
      <td>5</td>
      <td>37</td>
      <td>1</td>
      <td>3:41 PM</td>
      <td>11:45</td>
      <td>None</td>
      <td>None</td>
      <td>Aminu Offensive Foul Turnover (P1.T1)</td>
      <td>None</td>
      <td>0</td>
      <td>5</td>
      <td>202329</td>
      <td>Al-Farouq Aminu</td>
      <td>1.610613e+09</td>
      <td>Portland</td>
      <td>Trail Blazers</td>
      <td>POR</td>
      <td>0</td>
      <td>0</td>
      <td>None</td>
      <td>NaN</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>1</td>
      <td>0</td>
      <td>None</td>
      <td>NaN</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>1</td>
      <td>705</td>
      <td>0.0</td>
      <td>15.0</td>
      <td>2880.0</td>
      <td>2865.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>0041800237</td>
      <td>10</td>
      <td>1</td>
      <td>6</td>
      <td>1</td>
      <td>3:42 PM</td>
      <td>11:28</td>
      <td>Harris 2' Driving Layup (2 PTS)</td>
      <td>None</td>
      <td>None</td>
      <td>0 - 2</td>
      <td>2</td>
      <td>4</td>
      <td>203914</td>
      <td>Gary Harris</td>
      <td>1.610613e+09</td>
      <td>Denver</td>
      <td>Nuggets</td>
      <td>DEN</td>
      <td>0</td>
      <td>0</td>
      <td>None</td>
      <td>NaN</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>0</td>
      <td>0</td>
      <td>None</td>
      <td>NaN</td>
      <td>None</td>
      <td>None</td>
      <td>None</td>
      <td>1</td>
      <td>688</td>
      <td>17.0</td>
      <td>32.0</td>
      <td>2880.0</td>
      <td>2848.0</td>
    </tr>
  </tbody>
</table>
</div>



Now to set up the classes in order to keep track of who is on and off the court. I'm creating a class object for each player, team and lineup (called LineupStats) and then a Game class that parses through the play by play. Creating the team class also runs helper functions to pull the rosters and starters from the box score we pulled earlier:


```python
class Player():
    def __init__(self, playerid, teamid, name):
        self.playerid = playerid
        self.teamid = teamid
        self.name = name
        self.oncourt = 0
        self.court_time = 0
        
    def to_dict(self):
        return {
            'court_time' : self.court_time,
            'playerid' : self.playerid, 
            'teamid' : self.teamid
        }

class Team():
    def __init__(self, teamid, gameid):
        self.court_time = 0
        self.roster = []
        self.lineup = []
        self.teamid = teamid
        self.gameid = gameid
        self.starters = []
        self.lineups = []
        
    def getRoster(self, box):
        for index,row in box.iterrows():
            if row['team_id'] == self.teamid:
                x = Player(playerid = row['player_id'],teamid = row['team_id'], name = row['player_name'])
                self.roster.append(x)
            
    def getStarters(self, box):
        for index,row in box.iterrows():
            if row['team_id'] == self.teamid and row['start_position'] != '':
                for p in self.roster:
                    if p.playerid == row['player_id']:    
                        self.lineup.append(p)
                        self.starters.append(p)
                        p.oncourt = 1  
                        
    def initLineup(self):
        if self.lineup:
            self.lu = LineupStats(self.lineup, self.gameid, self.teamid)
    
    def Sub(self, sub_in, sub_out, event, time):
        self.resetLineup(event, time)
        for x in self.lineup:
            if x.playerid == sub_out:
                x.oncourt = 0
                self.lineup.remove(x)
        for x in self.roster:
            if x.playerid == sub_in:
                x.oncourt = 1
                self.lineup.append(x)  
    
    def quarterSubs(self, lineup):
        for x in self.lineup[:]:
            if x.playerid not in lineup:
                self.lineup.remove(x)
                x.oncourt = 0
        for l in lineup:
            for x in self.roster:
                if x.playerid == l and x.oncourt == 0:
                    self.lineup.append(x)
                    x.oncourt = 1
    
    def resetLineup(self, event, time):
        self.lineups.append(self.lu.to_dict(time))
        self.lu.pts = 0        
        self.lu.drbd = 0
        self.lu.orbd = 0
        self.lu.stl = 0
        self.lu.blk = 0
        self.lu.ast = 0
        self.lu.fgm = 0
        self.lu.fga = 0
        self.lu.ftm = 0
        self.lu.fta = 0
        self.lu.pf = 0
        self.lu.tov = 0   
        self.lu.lu_time = 0
        self.lu.diff = 0
        self.lu.fg3a = 0
        self.lu.fg3m = 0  
        self.lu.poss = 0
        self.lu.event_start = event
        self.lu.time_on = time
            
    def to_dict(self):
        return {
            'teamid' : self.teamid,
            'gameid' : self.gameid,
            'court_time' : self.court_time,
            'starters' : [int(x.playerid) for x in self.starters]
        }
    

class LineupStats():
    def __init__(self, lineup, gameid,teamid):
        self.lineup = lineup
        self.pts = 0
        self.drbd = 0
        self.orbd = 0
        self.stl = 0
        self.blk = 0
        self.ast = 0
        self.fgm = 0
        self.fga = 0
        self.ftm = 0
        self.fta = 0
        self.pf = 0
        self.tov = 0   
        self.lu_time = 0
        self.diff = 0
        self.fg3a = 0
        self.fg3m = 0
        self.event_start = 0
        self.time_on = 0
        self.time_off = 0
        self.event_end = 0
        self.gameid = gameid
        self.teamid = teamid
        self.poss = 0
        
    def to_dict(self, time_end):
        return {
            'lineup' : [int(x.playerid) for x in self.lineup],
            'pts' : self.pts,
            'drbd' : self.drbd,
            'stl' : self.stl,
            'blk' : self.blk,
            'ast' : self.ast,
            'fgm' : self.fgm,
            'fga' : self.fga,
            'ftm' : self.ftm,
            'fta' : self.fta,
            'orbd' : self.orbd,
            'pf' : self.pf,
            'tov' : self.tov,
            'fg3a' : self.fg3a,
            'fg3m' : self.fg3m,
            'lu_time' : self.lu_time,
            'diff' : self.diff ,
            'event_start' : self.event_start,
            'time_on' : self.time_on,
            'time_off' : time_end,
            'gameid' : self.gameid,
            'teamid' : self.teamid,
            'poss' : self.poss
        }      
    

class Game():
    def __init__(self, hteam, ateam,  gameid, pbp, box):
        self.hteam = hteam
        self.ateam = ateam
        self.time_elapsed = 0
        self.event = 1
        self.pbp = pbp
        self.box = box
        self.poss = 0
        
    def initRosters(self):
        self.hteam.getRoster(self.box)
        self.ateam.getRoster(self.box)
        
    def initStarters(self):
        self.hteam.getStarters(self.box)
        self.ateam.getStarters(self.box)
                
    def addCourtTime(self, time):
        for x in self.hteam.lineup:
            x.court_time += time
        for x in self.ateam.lineup:
            x.court_time += time

    def getQuarterStarters(self, quarter):
        if quarter == 2:
            start_range = 7201
            end_range = 7493
        elif quarter == 3:
            start_range = 14410
            end_range = 14640
        elif quarter == 4:
            start_range = 21621
            end_range = 21913          
        starters_url = 'https://stats.nba.com/stats/boxscoretraditionalv2?EndPeriod=14&GameID=0041800237&RangeType=2&Season=2018-19&SeasonType=Playoffs&StartPeriod=1&StartRange=' + str(start_range) + '&EndRange=' + str(end_range)
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64)', 'x-nba-stats-origin': 'stats', 'x-nba-stats-token': 'true', 'Host':'stats.nba.com', 'Referer':'https://stats.nba.com/game/0021900306/'}
        r= requests.get(starters_url, headers=headers, timeout = 5)
        data = json.loads(r.text)
        starters = pd.DataFrame.from_dict(data['resultSets'][0]['rowSet'])
        col_names = data['resultSets'][0]['headers']
        starters.columns = col_names
        starters.columns = starters.columns.str.lower()
        hteam_starters = starters[starters['team_id']==self.hteam.teamid]
        ateam_starters = starters[starters['team_id']==self.ateam.teamid]
        hteam_starters = list(hteam_starters['player_id'])
        ateam_starters = list(ateam_starters['player_id'])
        self.hteam.quarterSubs(hteam_starters)
        self.ateam.quarterSubs(ateam_starters)
        
    def parseGame(self):
        self.initRosters()
        self.initStarters()
        self.hteam.initLineup()
        self.ateam.initLineup()
        for index, row in self.pbp.iterrows():
            assert len(self.hteam.lineup)==5, 'home lineup not equal to 5'
            assert len(self.ateam.lineup)==5, 'away lineup not equal to 5'
            if row['pctimestring'] == '12:00' and row['period'] != 1 and row['period'] != prev_row_period:
                self.getQuarterStarters(int(row['period']))
            self.addCourtTime(row['play_elapsed_time'])
            if row['eventmsgtype'] == 1:
                if row['player1_team_id'] == self.hteam.teamid:
                    self.hteam.lu.diff += row['scoremargin']
                    self.ateam.lu.diff -= row['scoremargin']
                    self.hteam.lu.pts += row['scoremargin']
                else:
                    self.ateam.lu.diff += row['scoremargin']
                    self.hteam.lu.diff -= row['scoremargin']
                    self.ateam.lu.pts += row['scoremargin']      
            if row['eventmsgtype'] == 8:
                if row['player1_team_id'] == game.hteam.teamid:
                    self.hteam.Sub(sub_in=row['player2_id'], sub_out=row['player1_id'], event=row['eventnum'], time=row['time_remaining'])
                else:
                    self.ateam.Sub(sub_in=row['player2_id'], sub_out=row['player1_id'], event=row['eventnum'], time=row['time_remaining'])   
            prev_row_period = row['period']
        
```


```python
por = Team(gameid='0041800237', teamid=1610612757)
por.getRoster(box)

for x in por.roster:
    print(x.playerid, x.name)
```

    203090 Maurice Harkless
    202329 Al-Farouq Aminu
    202683 Enes Kanter
    203468 CJ McCollum
    203081 Damian Lillard
    1628380 Zach Collins
    203918 Rodney Hood
    203552 Seth Curry
    202323 Evan Turner
    203086 Meyers Leonard
    1627746 Skal Labissiere
    1627774 Jake Layman
    1629014 Anfernee Simons
    


```python
por.getStarters(box)

for x in por.starters:
    print(x.playerid, x.name)

for x in por.lineup:
    print(x.playerid, x.name)
```

    203090 Maurice Harkless
    202329 Al-Farouq Aminu
    202683 Enes Kanter
    203468 CJ McCollum
    203081 Damian Lillard
    203090 Maurice Harkless
    202329 Al-Farouq Aminu
    202683 Enes Kanter
    203468 CJ McCollum
    203081 Damian Lillard
    

Notice above the starters for Portland is the same as the lineup for Portland because we've only pulled in the box score rosters and the starters from the box score. Trivial, but important to note where I'm getting that data before getting into the play by play. Getting into the real meat and potatoes of how I'm parsing substitutions, here's the function that runs everything within the Game Class: 


```python
def parseGame(self):
    self.initRosters()
    self.initStarters()
    self.hteam.initLineup()
    self.ateam.initLineup()
    for index, row in self.pbp.iterrows():
        assert len(self.hteam.lineup)==5, 'home lineup not equal to 5'
        assert len(self.ateam.lineup)==5, 'away lineup not equal to 5'
        if row['pctimestring'] == '12:00' and row['period'] != 1 and row['period'] != prev_row_period:
            self.getQuarterStarters(int(row['period']))
        self.addCourtTime(row['play_elapsed_time'])
        if row['eventmsgtype'] == 1:
            if row['player1_team_id'] == self.hteam.teamid:
                self.hteam.lu.diff += row['scoremargin']
                self.ateam.lu.diff -= row['scoremargin']
                self.hteam.lu.pts += row['scoremargin']
            else:
                self.ateam.lu.diff += row['scoremargin']
                self.hteam.lu.diff -= row['scoremargin']
                self.ateam.lu.pts += row['scoremargin']      
        if row['eventmsgtype'] == 8:
            if row['player1_team_id'] == game.hteam.teamid:
                self.hteam.Sub(sub_in=row['player2_id'], sub_out=row['player1_id'], event=row['eventnum'], time=row['time_remaining'])
            else:
                self.ateam.Sub(sub_in=row['player2_id'], sub_out=row['player1_id'], event=row['eventnum'], time=row['time_remaining'])   
        prev_row_period = row['period']
```

The first five rows I'm just initializing the game. Then I start to loop through each row of the play by play.

    if row['pctimestring'] == '12:00' and row['period'] != 1 and row['period'] != prev_row_period:
        game.getQuarterStarters(int(row['period']))

NBA's PBP has a separate game event for the end and start of each period, so if the time at the current row is equal to '12:00' then I use the getQuarterStarters helper function in order to get the starters of each quarter from the NBA's box score query feature. 

    def getQuarterStarters(self, quarter):
        if quarter == 2:
            start_range = 7201
            end_range = 7493
        elif quarter == 3:
            start_range = 14410
            end_range = 14640
        elif quarter == 4:
            start_range = 21621
            end_range = 21913          
        starters_url = 'https://stats.nba.com/stats/boxscoretraditionalv2?EndPeriod=14&GameID=0041800237&RangeType=2&Season=2018-19&SeasonType=Playoffs&StartPeriod=1&StartRange=' + str(start_range) + '&EndRange=' + str(end_range)
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64)', 'x-nba-stats-origin': 'stats', 'x-nba-stats-token': 'true', 'Host':'stats.nba.com', 'Referer':'https://stats.nba.com/game/0021900306/'}
        r= requests.get(starters_url, headers=headers, timeout = 5)
        data = json.loads(r.text)
        starters = pd.DataFrame.from_dict(data['resultSets'][0]['rowSet'])
        col_names = data['resultSets'][0]['headers']
        starters.columns = col_names
        starters.columns = starters.columns.str.lower()
        hteam_starters = starters[starters['team_id']==self.hteam.teamid]
        ateam_starters = starters[starters['team_id']==self.ateam.teamid]
        hteam_starters = list(hteam_starters['player_id'])
        ateam_starters = list(ateam_starters['player_id'])
        self.hteam.quarterSubs(hteam_starters)
        self.ateam.quarterSubs(ateam_starters)
        
If the starters of the next quarter are different than the lineup that ended the quarter, I run the quarterSubs function from the Team class to replace the correct players:

    def quarterSubs(self, lineup):
        for x in self.lineup[:]:
            if x.playerid not in lineup:
                self.lineup.remove(x)
                x.oncourt = 0
        for l in lineup:
            for x in self.roster:
                if x.playerid == l and x.oncourt == 0:
                    self.lineup.append(x)
                    x.oncourt = 1

Since no time elapsed between the end of quarters, I don't need to change any lineup or player statistics.

        game.addCourtTime(row['play_elapsed_time'])

Just adding playing time for each player from the previous game event to the current.

The play-by-play from the NBA's API has an 'eventmsgtype' column that has a different key for each event on the court. For our purposes, 1 = made basket and 8 = substitution. Now we can check and see if there was a change in the score so we can update the scoring margin for each lineup:

        if row['eventmsgtype'] == 1:
            if row['player1_team_id'] == game.hteam.teamid:
                game.hteam.lu.diff += row['scoremargin']
                game.ateam.lu.diff -= row['scoremargin']
                game.hteam.lu.pts += row['scoremargin']
            else:
                game.ateam.lu.diff += row['scoremargin']
                game.hteam.lu.diff -= row['scoremargin']
                game.ateam.lu.pts += row['scoremargin']      
                
Finally, we get to the real meat and potatoes: parsing the actual substitutions. 

        if row['eventmsgtype'] == 8:
            if row['player1_team_id'] == game.hteam.teamid:
                game.hteam.Sub(sub_in=row['player2_id'], sub_out=row['player1_id'], event=row['eventnum'], time=row['time_remaining'])
            else:
                game.ateam.Sub(sub_in=row['player2_id'], sub_out=row['player1_id'], event=row['eventnum'], time=row['time_remaining'])   

    def Sub(self, sub_in, sub_out, event, time):
        self.resetLineup(event, time)
        for x in self.lineup:
            if x.playerid == sub_out:
                print('sub found')
                x.oncourt = 0
                self.lineup.remove(x)
        for x in self.roster:
            if x.playerid == sub_in:
                x.oncourt = 1
                self.lineup.append(x)  
                
Each substitution in the Game class calls the Sub function from our team class. In the PBP data, we see that for each substitution we have columns for the players involved (player_1_player_id, player_2_player_id, etc.).  After resetting the team's lineup because this is the end of that specific lineup's time on the court, we then search through the list of player ids inside of our lineup to find the player getting subbed out. We use the remove function in python in order to remove that player from the list, and then we append the new player's id into our lineup object. 

Here's how this looks in python if we sub in Zach Collins for Enes Kanter:


```python
por = Team(gameid='0041800237', teamid=1610612757)
den = Team(gameid='0041800237', teamid=1610612743)

game = Game(den, por, '0041800237',pbp,box)
game.initRosters()
game.initStarters()
game.hteam.initLineup()
game.ateam.initLineup()
for x in game.ateam.lineup:
    print(x.playerid, x.name)
```

    203090 Maurice Harkless
    202329 Al-Farouq Aminu
    202683 Enes Kanter
    203468 CJ McCollum
    203081 Damian Lillard
    


```python
game.ateam.Sub(sub_in=1628380, sub_out=202683, event=1, time=200)

for x in game.ateam.lineup:
    print(x.playerid, x.name)
```

    203090 Maurice Harkless
    202329 Al-Farouq Aminu
    203468 CJ McCollum
    203081 Damian Lillard
    1628380 Zach Collins
    


```python
por = Team(gameid='0041800237', teamid=1610612757)
den = Team(gameid='0041800237', teamid=1610612743)
game = Game(den, por, '0041800237',pbp,box)
game.parseGame()
```


```python
for x in game.ateam.roster:
    print(x.name, x.court_time)
```

    Maurice Harkless 1008.0
    Al-Farouq Aminu 428.0
    Enes Kanter 2379.0
    CJ McCollum 2717.0
    Damian Lillard 2725.0
    Zach Collins 1397.0
    Rodney Hood 1211.0
    Seth Curry 979.0
    Evan Turner 1152.0
    Meyers Leonard 404.0
    Skal Labissiere 0
    Jake Layman 0
    Anfernee Simons 0
    

A quick check of the box score shows that Damian Lillard played 45 minutes and 25 seconds. Our calculated court time within the player class shows that he played -- 2725 seconds or 45 minutes and 25 seconds! 

Hopefully you find this methodology useful. I've tinkered with this problem on-and-off for a while now and most of the solutions I tried (e.g. doing this in Pandas) just weren't very robust and had a lot of problems.
