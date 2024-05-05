<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />
    <a-layout-content class="responsive-padding" :style="{ marginTop: '12px' }">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item
          ><a href="/"><home-outlined /></a
        ></a-breadcrumb-item>
        <a-breadcrumb-item><a :href="leaguesUrl">Leagues</a></a-breadcrumb-item>
        <a-breadcrumb-item>{{ leagueInfo.leagueName }}</a-breadcrumb-item>
        <a-breadcrumb-item>{{ leagueInfo.userName }}</a-breadcrumb-item>
      </a-breadcrumb>
      <div style="">
        <div class="">
          <div class="">
            <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
              <a-col :span="18">
                <h2 class="league-title">
                  <img
                    class="league-logo"
                    :src="`https://sleepercdn.com/avatars/thumbs/${leagueInfo.avatar}`"
                    alt="League Logo"
                  />
                  {{ leagueInfo.leagueName }}
                </h2>
              </a-col>
              <a-col :span="6">
                <div class="gutter-box-refresh">
                  <a-button @click="insertLeagueDetials(leagueInfo.leagueId)" type="primary">
                    <ReloadOutlined /> League
                  </a-button>
                </div></a-col
              >
            </a-row>
          </div>

          <div class="">
            <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
              <a-col :span="16">
                <div class="gutter-box-buttons">
                  <a-tag color="cyan" size="large" style="">{{ selectedSource.name }}</a-tag>
                  <a-tag style="">{{ leagueInfo.rosterType }}</a-tag>
                  <a-tag style="">{{ leagueInfo.rankType }}</a-tag>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="gutter-box-refresh">
                  <a-button type="default" @click="getLeagueSummary()">
                    <FileSearchOutlined />Summary</a-button
                  >
                </div>
              </a-col>
            </a-row>
            <a-row>
              <a-col class="gutter-row" :span="12">
                <div class="gutter-box-button">
                  <span style="padding-right: 5px">Proj.</span>
                  <a-select ref="select" v-model:value="value1" @change="handleProjChange">
                    <a-select-option value="espn">ESPN</a-select-option>
                    <a-select-option value="cbs">CBS</a-select-option>
                    <a-select-option value="nfl" disabled>NFL</a-select-option>
                  </a-select>
                </div>
              </a-col>
              <a-col class="gutter-row" :span="12">
                <div class="gutter-box-refresh">
                  <span style="padding-right: 5px">Ranks:</span>
                  <a-dropdown-button :loading="summaryIsLoading">
                    <img style="padding-right: 5px" class="rank-logos" :src="selectedSource.logo" />
                    {{ selectedSource.name }}
                    <template #overlay>
                      <a-menu @click="handleMenuClick">
                        <a-menu-item v-for="source in filteredSources" :key="source.key">
                          <UserOutlined />
                          <img style="padding-right: 5px" class="rank-logos" :src="source.logo" />{{
                            source.name
                          }}
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown-button>
                </div>
              </a-col>
            </a-row>
            <a-row
              ><a-col class="gutter-row" :span="12"
                ><div class="gutter-box-dropdown">
                  <a-radio-group v-model:value="overallFilter">
                    <a-radio-button value="all">All Players</a-radio-button>
                    <a-radio-button value="STARTER">Starters</a-radio-button>
                  </a-radio-group>
                </div></a-col
              ></a-row
            >
          </div>
        </div>

        <a-spin tip="Loading..." :spinning="summaryIsLoading">
          <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="Overall">
              <h2 class="tab-sub-header">Power Ranks</h2>
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col :span="{ xs: 24, sm: 8, md: 8, lg: 8 }">
                  <div class="avatar-container">
                    <span class="avatar-title">League Managers</span>
                    <a-avatar-group
                      maxCount="10"
                      maxPopoverPlacement="bottom"
                      maxPopoverTrigger="hover"
                      :max-count="12"
                      class="avatar-group-container"
                    >
                      <div v-for="user in sortedSummaryData" :key="user.user_id">
                        <div
                          v-if="user.user_id === leagueInfo.userId"
                          style="position: relative; display: inline-block"
                        >
                          <a-tooltip
                            :title="`${getRank(user)} ${user.display_name}`"
                            placement="top"
                          >
                            <a-avatar
                              :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                              maxPopoverTrigger="hover"
                              :size="40"
                              style="border: 2px solid gold"
                            />
                          </a-tooltip>
                          <span class="badge-label">
                            {{ getRank(user) }}
                          </span>
                        </div>

                        <div v-else>
                          <a-tooltip
                            :title="`${getRank(user)} ${user.display_name}`"
                            placement="top"
                          >
                            <a-avatar
                              :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                              maxPopoverTrigger="hover"
                            />
                          </a-tooltip>
                        </div>
                      </div>
                    </a-avatar-group>
                  </div>
                </a-col>
              </a-row>

              <a-row gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                <a-col :xs="24" :sm="24" :md="12" :lg="11" :xl="11">
                  <div class="viz-container">
                    <h3 class="chart-title">Ranks</h3>

                    <BarChart :chartData="bchartData" />
                  </div>
                </a-col>
                <a-col :xs="0" :sm="0" :md="2" :lg="2" :xl="2"></a-col>
                <a-col :xs="24" :sm="24" :md="12" :lg="11" :xl="11">
                  <div class="viz-container">
                    <h3 class="chart-title">Tiers</h3>
                    <OverallScatterPlot :scatterPlotData="OverallScatterPlotData" />
                  </div>
                </a-col>
              </a-row>
              <h2 style="text-align: center">Ranks Heat Map</h2>
              <div class="table-section" style="flex: 2">
                <a-table
                  :columns="columns"
                  :dataSource="summaryData"
                  :pagination="{ pageSize: 20 }"
                  row-key="user_id"
                  :expand-column-width="100"
                  style="width: 100%; max-width: 1150px"
                  :scroll="{ x: '1150px' }"
                >
                  <template #expandedRowRender="{ record }">
                    Team Composition:
                    <div class="card" bordered>
                      <MeterGroup :value="formatGaugeData(record, overallFilter)" />
                    </div>
                    <div>
                      <a-divider orientation="center"></a-divider>
                      <a-row justify="space-around" :gutter="{ xs: 0, sm: 2, md: 2, lg: 2, xl: 2 }">
                        <a-col :span="4">
                          <div>
                            <h3>
                              Quarterbacks
                              {{
                                addOrdinalSuffix(
                                  overallFilter === 'all' ? record.qb_rank : record.qb_starter_rank
                                )
                              }}
                            </h3>
                            <ul
                              style="padding: 0; list-style: none"
                              v-for="player in getPlayers(record.user_id)"
                            >
                              <li
                                v-if="player.player_position === 'QB'"
                                :key="player.sleeper_id"
                                :style="getPositionTagList(player.player_position, 0.35)"
                                style="margin-bottom: 2px"
                              >
                                <span>{{ player?.full_name }} {{ player?.team }} </span
                                ><span style="float: right">
                                  {{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value?.toLocaleString()
                                  }}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </a-col>

                        <a-col :span="4">
                          <div>
                            <h3>
                              Runningbacks
                              {{
                                addOrdinalSuffix(
                                  overallFilter === 'all' ? record.rb_rank : record.rb_starter_rank
                                )
                              }}
                            </h3>
                            <ul
                              style="padding: 0; list-style: none"
                              v-for="player in getPlayers(record.user_id)"
                            >
                              <li
                                v-if="player.player_position === 'RB'"
                                :key="player.sleeper_id"
                                :style="getPositionTagList(player.player_position, 0.35)"
                                style="margin-bottom: 2px"
                              >
                                <span>{{ player?.full_name }} {{ player?.team }}</span>
                                <span style="float: right"
                                  >{{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value?.toLocaleString()
                                  }}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </a-col>

                        <a-col :span="4">
                          <div>
                            <h3>
                              Wide Receivers
                              {{
                                addOrdinalSuffix(
                                  overallFilter === 'all' ? record.wr_rank : record.wr_starter_rank
                                )
                              }}
                            </h3>
                            <ul
                              style="padding: 0; list-style: none"
                              v-for="player in getPlayers(record.user_id)"
                            >
                              <li
                                v-if="player.player_position === 'WR'"
                                :key="player.sleeper_id"
                                :style="getPositionTagList(player.player_position, 0.35)"
                                style="margin-bottom: 2px"
                              >
                                <span>{{ player?.full_name }} {{ player?.team }}</span>
                                <span style="float: right"
                                  >{{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value?.toLocaleString()
                                  }}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </a-col>
                        <a-col :span="4">
                          <div>
                            <h3>
                              Tight Ends
                              {{
                                addOrdinalSuffix(
                                  overallFilter === 'all' ? record.te_rank : record.te_starter_rank
                                )
                              }}
                            </h3>
                            <ul
                              style="padding: 0; list-style: none"
                              v-for="player in getPlayers(record.user_id)"
                            >
                              <li
                                v-if="player.player_position === 'TE'"
                                :key="player.sleeper_id"
                                :style="getPositionTagList(player.player_position, 0.35)"
                                style="margin-bottom: 2px"
                              >
                                <span>{{ player?.full_name }} {{ player?.team }} </span>
                                <span style="float: right"
                                  >{{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value?.toLocaleString()
                                  }}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </a-col>
                        <a-col :span="4" v-if="overallFilter === 'all'">
                          <div>
                            <h3>Picks {{ addOrdinalSuffix(record.picks_rank) }}</h3>
                            <ul
                              style="padding: 0; list-style: none"
                              v-for="player in getPlayers(record.user_id)"
                            >
                              <li
                                v-if="player.player_position === 'PICKS'"
                                :key="player.sleeper_id"
                                :style="getPositionTagList(player.player_position, 0.35)"
                                style="margin-bottom: 2px"
                              >
                                <span>{{ player?.full_name }}</span
                                ><span style="float: right">
                                  {{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value?.toLocaleString()
                                  }}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </a-col>
                        <a-col :span="4" v-if="overallFilter !== 'all'">
                          <div>
                            <h3>Bench {{ addOrdinalSuffix(record.bench_rank) }}</h3>
                            <ul
                              style="padding: 0; list-style: none"
                              v-for="player in getAllPlayers(record.user_id)"
                            >
                              <li
                                v-if="player.fantasy_designation === 'BENCH'"
                                :key="player.sleeper_id"
                                :style="getPositionTagList(player.player_position, 0.2)"
                                style="border: 1px solid rgba(0, 0, 0, 0.2)"
                              >
                                <span
                                  >{{ player?.full_name }} &bull;
                                  {{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value?.toLocaleString()
                                  }}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </a-col>
                      </a-row>
                    </div>
                  </template>
                  <template v-slot:totalValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :title="`Total Value: ${record.total_value.toLocaleString()}`"
                      ><span>{{ record.total_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:qbValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :overlayStyle="{ maxWidth: '130px' }"
                      :title="`QB Value: ${record.qb_sum.toLocaleString()} 
              QB Avg. ${record.qb_average.toLocaleString()}`"
                      ><span>{{ record.qb_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:rbValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :overlayStyle="{ maxWidth: '130px' }"
                      :title="`RB Value: ${record.rb_sum.toLocaleString()} 
              RB Avg. ${record.rb_average.toLocaleString()}`"
                      ><span>{{ record.rb_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:wrValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :overlayStyle="{ maxWidth: '130px' }"
                      :title="`WR Value: ${record.wr_sum.toLocaleString()} 
              WR Avg. ${record.wr_average.toLocaleString()}`"
                      ><span>{{ record.wr_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:teValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :overlayStyle="{ maxWidth: '130px' }"
                      :title="`TE Value: ${record.te_sum.toLocaleString()} 
              TE Avg. ${record.te_average.toLocaleString()}`"
                      ><span>{{ record.te_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:picksValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :title="`Picks Value: ${record.picks_sum.toLocaleString()}`"
                      ><span>{{ record.picks_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:benchValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :overlayStyle="{ maxWidth: '150px' }"
                      :title="`Bench Value: ${record.bench_sum.toLocaleString()} 
              Bench Avg. ${record.bench_average.toLocaleString()}`"
                      ><span>{{ record.bench_rank_display }}</span>
                    </a-tooltip>
                  </template>
                </a-table>
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="Rosters">
              <h2 style="text-align: left">Players by Manager</h2>
              <a-row justify="space-around" :gutter="8">
                <a-col
                  v-for="manager in summaryData"
                  :key="manager.user_id"
                  xs="{24}"
                  sm="{12}"
                  md="{8}"
                  lg="{6}"
                  style="min-width: 300px; max-width: 315px"
                >
                  <div style="border: 1px solid lightgray; border-radius: 5px; margin: 10px">
                    <h4 style="padding: 5px 5px">
                      <img
                        class="manager-logos"
                        :src="`https://sleepercdn.com/avatars/thumbs/${manager.avatar}`"
                        alt="League Logo"
                      />
                      {{ manager.display_name }} &bull;

                      {{ overallFilter === 'all' ? 'Overall' : 'Starters' }}
                      {{
                        addOrdinalSuffix(
                          overallFilter === 'all' ? manager.total_rank : manager.starters_rank
                        )
                      }}
                      <a-tag>
                        {{
                          (overallFilter === 'all'
                            ? manager.total_value
                            : manager.starters_sum || 0
                          ).toLocaleString()
                        }}</a-tag
                      >
                    </h4>
                    <ul style="padding: 0; list-style-type: none">
                      <li
                        v-for="(player, index) in getPlayers(manager.user_id)"
                        :style="getPositionTagList(player.player_position, 0.35)"
                        style="
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          border-radius: 2px;
                          margin: 2px;
                        "
                      >
                        <span style="margin-right: 2px"> {{ index + 1 }}.</span>
                        <span style="margin-right: 5px">{{ player.full_name }}</span>
                        <span style="margin-right: 5px">{{ player.team }}</span>
                        <a-tag :style="getPositionTagList(player.player_position)">{{
                          player.player_position
                        }}</a-tag>
                        <span class="player-value">
                          {{
                            player.player_value === -1
                              ? 'N/A'
                              : player.player_value.toLocaleString()
                          }}
                        </span>
                      </li>
                    </ul>
                  </div>
                </a-col>
              </a-row>
            </a-tab-pane>
            <a-tab-pane key="3" tab="Positions">
              <h2 class="tab-sub-header">Rankings by Position</h2>
              <div style="display: flex; justify-content: left">
                <div class="avatar-container">
                  <span style="font-size: small" class="avatar-title">Managers (click) </span>
                  <a-avatar-group
                    maxCount="10"
                    maxPopoverPlacement="bottom"
                    maxPopoverTrigger="hover"
                    class="avatar-group-container"
                  >
                    <div v-for="user in sortedSummaryData" :key="user.user_id">
                      <div
                        v-if="user.user_id === leagueInfo.userId"
                        style="position: relative; display: inline-block"
                      >
                        <a-tooltip :title="`${getRank(user)} ${user.display_name}`" placement="top">
                          <a-avatar
                            :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                            maxPopoverTrigger="hover"
                            :size="40"
                            style="border: 2px solid gold"
                            @click="handleUserClick(user)"
                            class="avatar"
                          />
                        </a-tooltip>
                        <span class="badge-label">
                          {{ getRank(user) }}
                        </span>
                      </div>

                      <div v-else>
                        <a-tooltip :title="`${getRank(user)} ${user.display_name}`" placement="top">
                          <a-avatar
                            :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                            maxPopoverTrigger="hover"
                            @click="handleUserClick(user)"
                            :style="avatarStyle(user)"
                            class="avatar"
                          />
                        </a-tooltip>
                      </div>
                    </div>
                  </a-avatar-group>
                </div>
              </div>

              <div v-if="selectedUser" class="mirrored-user">
                <div class="user-card">
                  <a-row>
                    <a-col :span="9">
                      <div class="gutter-box">
                        <a-avatar
                          :src="`https://sleepercdn.com/avatars/thumbs/${selectedUser.avatar}`"
                          :size="24"
                          style="border: 2px solid rgb(39, 125, 161)"
                          class="avatar"
                        />
                      </div>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">QB</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">RB</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">WR</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">TE</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">Picks</span>
                    </a-col>
                  </a-row>
                  <a-row>
                    <a-col :span="9">
                      <h4>{{ selectedUser.display_name }}</h4>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <a-tag
                        :style="
                          getCellStyle(
                            overallFilter === 'all'
                              ? Number(selectedUser.qb_rank)
                              : Number(selectedUser.qb_starter_rank)
                          )
                        "
                      >
                        {{
                          addOrdinalSuffix(
                            overallFilter === 'all'
                              ? selectedUser.qb_rank
                              : selectedUser.qb_starter_rank
                          )
                        }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <a-tag
                        :style="
                          getCellStyle(
                            overallFilter === 'all'
                              ? Number(selectedUser.rb_rank)
                              : Number(selectedUser.rb_starter_rank)
                          )
                        "
                      >
                        {{
                          addOrdinalSuffix(
                            overallFilter === 'all'
                              ? selectedUser.rb_rank
                              : selectedUser.rb_starter_rank
                          )
                        }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <a-tag
                        :style="
                          getCellStyle(
                            overallFilter === 'all'
                              ? Number(selectedUser.wr_rank)
                              : Number(selectedUser.wr_starter_rank)
                          )
                        "
                      >
                        {{
                          addOrdinalSuffix(
                            overallFilter === 'all'
                              ? selectedUser.wr_rank
                              : selectedUser.wr_starter_rank
                          )
                        }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <a-tag
                        :style="
                          getCellStyle(
                            overallFilter === 'all'
                              ? Number(selectedUser.te_rank)
                              : Number(selectedUser.te_starter_rank)
                          )
                        "
                      >
                        {{
                          addOrdinalSuffix(
                            overallFilter === 'all'
                              ? selectedUser.te_rank
                              : selectedUser.te_starter_rank
                          )
                        }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3" v-if="overallFilter === 'all'">
                      <a-tag :style="getCellStyle(Number(selectedUser.picks_rank))">
                        {{ addOrdinalSuffix(selectedUser.picks_rank) }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3" v-if="overallFilter !== 'all'">
                      <a-tag> -- </a-tag>
                    </a-col>
                  </a-row>
                </div>
              </div>

              <div v-else class="mirrored-user">
                <div class="user-card">
                  <a-row>
                    <a-col :span="9">
                      <div class="gutter-box">
                        <a-avatar
                          :size="24"
                          style="border: 2px solid rgb(39, 125, 161)"
                          class="avatar"
                        />
                      </div>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">QB</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">RB</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">WR</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">TE</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">Picks</span>
                    </a-col>
                  </a-row>
                  <a-row>
                    <a-col :span="9">
                      <h4>Select Team</h4>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag> </a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag></a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag></a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag> </a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag> </a-col>
                  </a-row>
                </div>
              </div>

              <div class="legend">
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgb(39, 125, 161)"></span>
                  <span class="legend-text">QB</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgb(144, 190, 109)"></span>
                  <span class="legend-text">RB</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgb(67, 170, 139)"></span>
                  <span class="legend-text">WR</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgb(249, 132, 74)"></span>
                  <span class="legend-text">TE</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgba(70, 70, 70, 0.7)"></span>
                  <span class="legend-text">Picks</span>
                </div>
              </div>

              <a-row style="justify-content: center" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                <a-col
                  v-for="(players, position) in playersByPosition"
                  :key="position"
                  xs="{24}"
                  sm="{12}"
                  md="{8}"
                  lg="{6}"
                  style="min-width: 260px; max-width: 400px"
                >
                  <div>
                    <h3>{{ position }}</h3>
                    <ul style="padding: 0; list-style: none">
                      <li
                        v-for="(player, index) in players"
                        :key="player.sleeper_id"
                        :style="getPositionTagList(player.player_position, 0.45)"
                        style="border-radius: 2px; margin: 2px"
                        :class="{
                          lighter: clickedManager !== '' && clickedManager !== player.display_name
                        }"
                      >
                        <span
                          :class="{
                            'dimmed-text':
                              clickedManager !== '' && clickedManager !== player.display_name
                          }"
                        >
                          {{ index + 1 }}. {{ player?.full_name }} {{ player?.team }}
                        </span>
                        <span style="float: right"
                          >{{
                            player.player_value === -1
                              ? 'N/A'
                              : player.player_value?.toLocaleString()
                          }}
                        </span>
                      </li>
                    </ul>
                  </div>
                </a-col>
              </a-row>
            </a-tab-pane>
            <a-tab-pane key="4" tab="Projections">
              <a-space>
                <a-select
                  ref="select"
                  v-model:value="value1"
                  style="width: 175px"
                  @change="handleProjChange"
                >
                  <a-select-option value="espn">ESPN</a-select-option>
                  <a-select-option value="cbs">CBS</a-select-option>
                  <a-select-option value="nfl" disabled>NFL</a-select-option>
                </a-select>
              </a-space>

              <h2 style="text-align: center">League Projections</h2>

              <a-spin :spinning="isProjectionLoading">
                <div>
                  <a-row gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col :xs="24" :sm="24" :md="11" :lg="11" :xl="11">
                      <div class="viz-container">
                        <h3 class="chart-title">Projections by team</h3>
                        <ProjectionBarChart :chartData="projectionBarChartData" />
                      </div>
                    </a-col>
                    <a-col :xs="0" :sm="0" :md="2" :lg="2" :xl="2"></a-col>
                    <a-col :xs="24" :sm="24" :md="11" :lg="11" :xl="11">
                      <div class="viz-container">
                        <h3 class="chart-title">Rosters - Starters vs Bench %</h3>
                        <ProjectionPercentColumn
                          :projectionPercentColumnData="projectionPercentColumnData"
                        />
                      </div>
                    </a-col>
                  </a-row>

                  <a-row
                    ><a-col :span="24">
                      <h2 style="text-align: center">Projections Heat Map</h2>
                      <a-table
                        :data-source="projSummaryData"
                        :columns="projColumns"
                        :pagination="{ pageSize: 20 }"
                        style="width: 100%; max-width: 1150px"
                        row-key="user_id"
                        :expand-column-width="100"
                        :scroll="{ x: '850px' }"
                        ><template #expandedRowRender="{ record }">
                          <div>
                            <a-divider orientation="center"></a-divider>
                            <a-row justify="space-between" gutter="[8,8]">
                              <a-col :xs="5" :sm="5" :md="5" :lg="5" :xl="5">
                                <div>
                                  <h3>Quarterbacks {{ addOrdinalSuffix(record.qb_rank) }}</h3>
                                  <ul
                                    style="padding: 0; list-style: none"
                                    v-for="player in getPlayersProj(record.user_id)"
                                  >
                                    <li
                                      v-if="player.player_position === 'QB'"
                                      :key="player.sleeper_id"
                                      :style="getPositionTagList(player.player_position, 0.35)"
                                      style="margin-bottom: 2px"
                                    >
                                      <span>{{ player?.full_name }} {{ player?.team }}</span>
                                      <span style="float: right"
                                        >{{
                                          player.player_value === -1
                                            ? 'N/A'
                                            : player.player_value?.toLocaleString()
                                        }}
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </a-col>

                              <a-col :span="5">
                                <div>
                                  <h3>Runningbacks {{ addOrdinalSuffix(record.rb_rank) }}</h3>
                                  <ul
                                    style="padding: 0; list-style: none"
                                    v-for="player in getPlayersProj(record.user_id)"
                                  >
                                    <li
                                      v-if="player.player_position === 'RB'"
                                      :key="player.sleeper_id"
                                      :style="getPositionTagList(player.player_position, 0.35)"
                                      style="margin-bottom: 2px"
                                    >
                                      <span>{{ player?.full_name }} {{ player?.team }} </span>
                                      <span style="float: right"
                                        >{{
                                          player.player_value === -1
                                            ? 'N/A'
                                            : player.player_value?.toLocaleString()
                                        }}
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </a-col>

                              <a-col :span="5">
                                <div>
                                  <h3>Wide Receivers {{ addOrdinalSuffix(record.wr_rank) }}</h3>
                                  <ul
                                    style="padding: 0; list-style: none"
                                    v-for="player in getPlayersProj(record.user_id)"
                                  >
                                    <li
                                      v-if="player.player_position === 'WR'"
                                      :key="player.sleeper_id"
                                      :style="getPositionTagList(player.player_position, 0.35)"
                                      style="margin-bottom: 2px"
                                    >
                                      <span>{{ player?.full_name }} {{ player?.team }} </span>
                                      <span style="float: right"
                                        >{{
                                          player.player_value === -1
                                            ? 'N/A'
                                            : player.player_value?.toLocaleString()
                                        }}
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </a-col>
                              <a-col :span="5">
                                <div>
                                  <h3>Tight Ends {{ addOrdinalSuffix(record.te_rank) }}</h3>
                                  <ul
                                    style="padding: 0; list-style: none"
                                    v-for="player in getPlayersProj(record.user_id)"
                                  >
                                    <li
                                      v-if="player.player_position === 'TE'"
                                      :key="player.sleeper_id"
                                      :style="getPositionTagList(player.player_position, 0.35)"
                                      style="margin-bottom: 2px"
                                    >
                                      <span>{{ player?.full_name }} {{ player?.team }} </span>
                                      <span style="float: right"
                                        >{{
                                          player.player_value === -1
                                            ? 'N/A'
                                            : player.player_value?.toLocaleString()
                                        }}
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </a-col>
                            </a-row>
                          </div>
                        </template>
                      </a-table>
                    </a-col>
                  </a-row>
                </div>
              </a-spin>
            </a-tab-pane>

            <a-tab-pane key="5" tab="Players">
              <h2 class="tab-sub-header">All Players in League</h2>
              <div style="display: flex; justify-content: left">
                <div class="avatar-container">
                  <span style="font-size: small" class="avatar-title">Managers (click) </span>
                  <a-avatar-group
                    maxCount="10"
                    maxPopoverPlacement="bottom"
                    maxPopoverTrigger="hover"
                    class="avatar-group-container"
                  >
                    <div v-for="user in sortedSummaryData" :key="user.user_id">
                      <div
                        v-if="user.user_id === leagueInfo.userId"
                        style="position: relative; display: inline-block"
                      >
                        <a-tooltip :title="`${getRank(user)} ${user.display_name}`" placement="top">
                          <a-avatar
                            :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                            maxPopoverTrigger="hover"
                            :size="45"
                            style="border: 2px solid gold"
                            @click="handleUserClick(user)"
                            class="avatar"
                          />
                        </a-tooltip>
                        <span class="badge-label">
                          {{ getRank(user) }}
                        </span>
                      </div>

                      <div v-else>
                        <a-tooltip :title="`${getRank(user)}${user.display_name}`" placement="top">
                          <a-avatar
                            :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                            maxPopoverTrigger="hover"
                            @click="handleUserClick(user)"
                            class="avatar"
                            :style="avatarStyle(user)"
                          />
                        </a-tooltip>
                      </div>
                    </div>
                  </a-avatar-group>
                </div>
              </div>
              <div v-if="selectedUser" class="mirrored-user">
                <div class="user-card">
                  <a-row>
                    <a-col :span="9">
                      <div class="gutter-box">
                        <a-avatar
                          :src="`https://sleepercdn.com/avatars/thumbs/${selectedUser.avatar}`"
                          :size="24"
                          style="border: 2px solid rgb(39, 125, 161)"
                          class="avatar"
                        />
                      </div>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">QB</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">RB</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">WR</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">TE</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">Picks</span>
                    </a-col>
                  </a-row>
                  <a-row>
                    <a-col :span="9">
                      <h4>{{ selectedUser.display_name }}</h4>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <a-tag
                        :style="
                          getCellStyle(
                            overallFilter === 'all'
                              ? Number(selectedUser.qb_rank)
                              : Number(selectedUser.qb_starter_rank)
                          )
                        "
                      >
                        {{
                          addOrdinalSuffix(
                            overallFilter === 'all'
                              ? selectedUser.qb_rank
                              : selectedUser.qb_starter_rank
                          )
                        }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <a-tag
                        :style="
                          getCellStyle(
                            overallFilter === 'all'
                              ? Number(selectedUser.rb_rank)
                              : Number(selectedUser.rb_starter_rank)
                          )
                        "
                      >
                        {{
                          addOrdinalSuffix(
                            overallFilter === 'all'
                              ? selectedUser.rb_rank
                              : selectedUser.rb_starter_rank
                          )
                        }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <a-tag
                        :style="
                          getCellStyle(
                            overallFilter === 'all'
                              ? Number(selectedUser.wr_rank)
                              : Number(selectedUser.wr_starter_rank)
                          )
                        "
                      >
                        {{
                          addOrdinalSuffix(
                            overallFilter === 'all'
                              ? selectedUser.wr_rank
                              : selectedUser.wr_starter_rank
                          )
                        }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <a-tag
                        :style="
                          getCellStyle(
                            overallFilter === 'all'
                              ? Number(selectedUser.te_rank)
                              : Number(selectedUser.te_starter_rank)
                          )
                        "
                      >
                        {{
                          addOrdinalSuffix(
                            overallFilter === 'all'
                              ? selectedUser.te_rank
                              : selectedUser.te_starter_rank
                          )
                        }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3" v-if="overallFilter === 'all'">
                      <a-tag :style="getCellStyle(Number(selectedUser.picks_rank))">
                        {{ addOrdinalSuffix(selectedUser.picks_rank) }}
                      </a-tag>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3" v-if="overallFilter !== 'all'">
                      <a-tag> -- </a-tag>
                    </a-col>
                  </a-row>
                </div>
              </div>

              <div v-else class="mirrored-user">
                <div class="user-card">
                  <a-row>
                    <a-col :span="9">
                      <div class="gutter-box">
                        <a-avatar
                          :size="24"
                          style="border: 2px solid rgb(39, 125, 161)"
                          class="avatar"
                        />
                      </div>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">QB</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">RB</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">WR</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">TE</span>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3">
                      <span style="font-weight: bold">Picks</span>
                    </a-col>
                  </a-row>
                  <a-row>
                    <a-col :span="9">
                      <h4>Select Team</h4>
                    </a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag> </a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag></a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag></a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag> </a-col>
                    <a-col class="gutter-box-stats" :span="3"> <a-tag>-/-</a-tag> </a-col>
                  </a-row>
                </div>
              </div>
              <div class="legend">
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgb(39, 125, 161)"></span>
                  <span class="legend-text">QB</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgb(144, 190, 109)"></span>
                  <span class="legend-text">RB</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgb(67, 170, 139)"></span>
                  <span class="legend-text">WR</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgb(249, 132, 74)"></span>
                  <span class="legend-text">TE</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: rgba(70, 70, 70, 0.7)"></span>
                  <span class="legend-text">Picks</span>
                </div>
              </div>
              <a-row :gutter="16">
                <a-col
                  v-for="(chunk, chunkIndex) in playerChunks"
                  :key="chunkIndex"
                  :xs="24"
                  :sm="12"
                  :md="8"
                  :lg="6"
                >
                  <div
                    style="
                      border: 1px solid lightgray;
                      border-radius: 5px;
                      margin: 5px;
                      padding: 5px;
                    "
                  >
                    <ul style="padding: 0">
                      <li
                        v-for="(player, index) in chunk"
                        :key="player.sleeper_id"
                        :style="getPositionTagList(player.player_position, 0.35)"
                        style="border-radius: 2px; margin: 2px"
                        :class="{
                          lighter: clickedManager !== '' && clickedManager !== player.display_name
                        }"
                      >
                        <span
                          :class="{
                            'dimmed-text':
                              clickedManager !== '' && clickedManager !== player.display_name
                          }"
                        >
                          {{ index + 1 + chunkIndex * 50 }}. {{ player?.full_name }} &bull;
                          {{
                            player.player_value === -1
                              ? 'N/A'
                              : player.player_value?.toLocaleString()
                          }}
                          - {{ player.display_name }}
                        </span>
                      </li>
                    </ul>
                  </div>
                </a-col>
              </a-row>
            </a-tab-pane>

            <a-tab-pane key="6" tab="Manager View">
              <h2 class="tab-sub-header">Team Dashboard</h2>
              <h3 class="chart-title">Roster</h3>
              <div v-for="manager in summaryData" :key="manager.user_id">
                <div v-if="manager.user_id === leagueInfo.userId">
                  <a-row :gutter="{ xs: 0, sm: 16, md: 24, lg: 16, xl: 16 }" justify="space-around">
                    <div
                      v-for="position in ['QB', 'RB', 'WR', 'TE', 'PICKS']"
                      :key="position"
                      style="padding-bottom: 15px"
                    >
                      <a-col :key="position" :xs="24" :sm="24" :md="24" :lg="32">
                        <a-card style="min-width: 220px">
                          <template #title>
                            <a-tag :style="getPositionTag(position)" size="large"
                              >{{ position }} </a-tag
                            >&bull;
                            {{ addOrdinalSuffix(manager[position.toLowerCase() + '_rank'] || '') }}
                            &bull;
                            {{ (manager[position.toLowerCase() + '_sum'] || '').toLocaleString() }}
                          </template>
                          <div
                            v-for="(player, index) in getPlayers(manager.user_id)"
                            :key="player.full_name"
                          >
                            <div v-if="player.player_position === position">
                              <ul style="padding: 0; list-style: none">
                                <li
                                  :key="player.sleeper_id"
                                  :style="getPositionTagList(player.player_position, 0.35)"
                                  style="margin-bottom: 2px"
                                >
                                  <span>
                                    {{ index + 1 }}. {{ player?.full_name }} &bull;
                                    {{
                                      player.player_value === -1
                                        ? 'N/A'
                                        : player.player_value?.toLocaleString()
                                    }}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </a-card>
                      </a-col>
                    </div>
                  </a-row>
                </div>
              </div>
              <a-row>
                <a-col :span="24">
                  <div class="viz-contaier">
                    <h3 class="chart-title">Position Groups Average Age by Value</h3>
                    <ScatterPlot :scatterPlotData="scatterPlotData" />
                  </div>
                </a-col>
                <!-- <a-col :span="12">
                  <RadarChart :data="radarChartData" />
                </a-col> -->
              </a-row>
              <h3 class="chart-title">By Position Overall and Starters only</h3>
              <div class="progress-bars-section-mv">
                <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="progress-bars-section-mv">
                  <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                    <div class="progress-bar-group-mv" v-if="leagueOwnerData">
                      <h3>
                        Overall
                        {{ addOrdinalSuffix(leagueOwnerData.total_rank) }}
                      </h3>
                      <span>QB</span>
                      <span style="float: right"> Max</span>
                      <a-tooltip
                        :title="`${addOrdinalSuffix(leagueOwnerData.qb_rank)} ${leagueOwnerData.qb_sum?.toLocaleString()}`"
                        ><a-progress
                          :percent="(leagueOwnerData.qb_sum / leagueOwnerData.qb_max_value) * 100"
                          :strokeColor="getPositionColor('QB')"
                          strokeWidth="15"
                          :format="(percent) => `${leagueOwnerData.qb_max_value?.toLocaleString()}`"
                        />
                      </a-tooltip>
                      <span>RB</span>
                      <a-tooltip
                        :title="`${addOrdinalSuffix(leagueOwnerData.rb_rank)} ${leagueOwnerData.rb_sum?.toLocaleString()}`"
                        ><a-progress
                          :percent="(leagueOwnerData.rb_sum / leagueOwnerData.rb_max_value) * 100"
                          :strokeColor="getPositionColor('RB')"
                          strokeWidth="15"
                          :format="(percent) => `${leagueOwnerData.rb_max_value?.toLocaleString()}`"
                        />
                      </a-tooltip>
                      <span>WR</span>
                      <a-tooltip
                        :title="`${addOrdinalSuffix(leagueOwnerData.wr_rank)} ${leagueOwnerData.wr_sum?.toLocaleString()}`"
                        ><a-progress
                          :percent="(leagueOwnerData.wr_sum / leagueOwnerData.wr_max_value) * 100"
                          :strokeColor="getPositionColor('WR')"
                          strokeWidth="15"
                          :format="(percent) => `${leagueOwnerData.wr_max_value?.toLocaleString()}`"
                        />
                      </a-tooltip>
                      <span>TE</span>
                      <a-tooltip
                        :title="`${addOrdinalSuffix(leagueOwnerData.te_rank)} ${leagueOwnerData.te_sum?.toLocaleString()}`"
                        ><a-progress
                          :percent="(leagueOwnerData.te_sum / leagueOwnerData.te_max_value) * 100"
                          :strokeColor="getPositionColor('TE')"
                          strokeWidth="15"
                          :format="(percent) => `${leagueOwnerData.te_max_value?.toLocaleString()}`"
                        />
                      </a-tooltip>
                      <div>
                        <span>Picks</span>
                        <a-tooltip
                          :title="`${addOrdinalSuffix(leagueOwnerData.picks_rank)} ${leagueOwnerData.picks_sum?.toLocaleString()}`"
                          ><a-progress
                            :percent="
                              (leagueOwnerData.picks_sum / leagueOwnerData.picks_max_value) * 100
                            "
                            :strokeColor="getPositionColor('Picks')"
                            strokeWidth="15"
                            :format="
                              (percent) => `${leagueOwnerData.picks_max_value?.toLocaleString()}`
                            "
                          />
                        </a-tooltip>
                      </div>
                    </div>
                  </a-col>
                  <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                    <div class="progress-bar-group-mv" v-if="leagueOwnerData">
                      <h3>
                        Starters
                        {{ addOrdinalSuffix(leagueOwnerData.starters_rank) }}
                      </h3>
                      <span>QB</span>
                      <a-tooltip
                        :title="`${addOrdinalSuffix(leagueOwnerData.qb_starter_rank)} ${leagueOwnerData.qb_starter_sum?.toLocaleString()}`"
                        ><a-progress
                          :percent="
                            (leagueOwnerData.qb_starter_sum /
                              leagueOwnerData.qb_max_starter_value) *
                            100
                          "
                          :strokeColor="getPositionColor('QB')"
                          strokeWidth="15"
                          :format="
                            (percent) => `${leagueOwnerData.qb_max_starter_value?.toLocaleString()}`
                          "
                        />
                      </a-tooltip>
                      <span>RB</span>
                      <a-tooltip
                        :title="`${addOrdinalSuffix(leagueOwnerData.rb_starter_rank)} ${leagueOwnerData.rb_starter_sum?.toLocaleString()}`"
                        ><a-progress
                          :percent="
                            (leagueOwnerData.rb_starter_sum /
                              leagueOwnerData.rb_max_starter_value) *
                            100
                          "
                          :strokeColor="getPositionColor('RB')"
                          strokeWidth="15"
                          :format="
                            (percent) => `${leagueOwnerData.rb_max_starter_value?.toLocaleString()}`
                          "
                        />
                      </a-tooltip>
                      <span>WR</span>
                      <a-tooltip
                        :title="`${addOrdinalSuffix(leagueOwnerData.wr_starter_rank)} ${leagueOwnerData.wr_starter_sum?.toLocaleString()}`"
                        ><a-progress
                          :percent="
                            (leagueOwnerData.wr_starter_sum /
                              leagueOwnerData.wr_max_starter_value) *
                            100
                          "
                          :strokeColor="getPositionColor('WR')"
                          strokeWidth="15"
                          :format="
                            (percent) => `${leagueOwnerData.wr_max_starter_value?.toLocaleString()}`
                          "
                        />
                      </a-tooltip>
                      <span>TE</span>
                      <a-tooltip
                        :title="`${addOrdinalSuffix(leagueOwnerData.te_starter_rank)} ${leagueOwnerData.te_starter_sum?.toLocaleString()}`"
                        ><a-progress
                          :percent="
                            (leagueOwnerData.te_starter_sum /
                              leagueOwnerData.te_max_starter_value) *
                            100
                          "
                          :strokeColor="getPositionColor('TE')"
                          strokeWidth="15"
                          :format="
                            (percent) => `${leagueOwnerData.te_max_starter_value?.toLocaleString()}`
                          "
                        />
                      </a-tooltip>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </a-tab-pane>
            <a-tab-pane key="7" tab="Waivers">
              <div>
                <h2>Best Available</h2>
                <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                  <a-col
                    v-for="(players, position) in groupedPlayers"
                    :key="position"
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="6"
                  >
                    <a-card>
                      <template #title>
                        <span style="font-size: 18px; font-weight: bolder">{{ position }}</span>
                      </template>
                      <span v-for="player in players" :key="player.sleeper_id">
                        <ul style="padding: 0; list-style: none">
                          <li
                            :key="player.sleeper_id"
                            :style="getPositionTagList(player.player_position, 0.35)"
                            style="margin-bottom: 2px"
                          >
                            <span>
                              {{ player?.full_name }} &bull;
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value?.toLocaleString()
                              }}
                            </span>
                          </li>
                        </ul>
                      </span>
                    </a-card>
                  </a-col>
                </a-row>
              </div>
            </a-tab-pane>
            <a-tab-pane key="8" tab="Trades (Beta)">
              <h2 style="text-align: left">Trades Table</h2>

              <a-spin :spinning="isTradesLoading">
                <div>
                  <a-table
                    :columns="tradeColumns"
                    :dataSource="tradesSummaryData"
                    :pagination="{ pageSize: 20 }"
                    row-key="display_name"
                    :loading="isTradesLoading"
                    :expand-column-width="100"
                    style="max-width: 800px"
                    :scroll="{ x: '800px' }"
                  >
                  </a-table>
                </div>
                <h2 style="text-align: center">Trade History</h2>

                <a-divider />
                <a-row
                  v-for="(managers, transaction_id) in tradesDetailData"
                  :key="transaction_id"
                  :gutter="24"
                  justify="center"
                >
                  <a-col
                    xs="24"
                    sm="24"
                    md="12"
                    lg="8"
                    v-for="(details, manager) in managers"
                    :key="manager"
                  >
                    <a-card style="width: 100%; max-width: 600px; margin: auto">
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          padding-bottom: 5px;
                        "
                      >
                        <h3 style="margin: 0">{{ manager }}</h3>
                        <span>
                          <a-tag
                            :color="
                              details[0].owner_total -
                                (details[0].deal_total - details[0].owner_total) <
                              0
                                ? 'red'
                                : 'green'
                            "
                          >
                            {{
                              (
                                details[0].owner_total -
                                (details[0].deal_total - details[0].owner_total)
                              ).toLocaleString()
                            }} </a-tag
                          >-
                          <a-tag color="blue">{{ details[0].deal_total.toLocaleString() }}</a-tag>
                        </span>
                      </div>
                      <a-list-item
                        v-for="asset in details"
                        :key="asset.asset"
                        style="padding-bottom: 5px"
                      >
                        <a-avatar
                          :src="`https://sleepercdn.com/content/nfl/players/thumb/${asset.sleeper_id}.jpg`"
                        />
                        {{ asset.asset }} &bull; {{ asset._position }}
                        {{ asset.value.toLocaleString() }}
                      </a-list-item>
                    </a-card>
                  </a-col>
                  <a-divider />
                </a-row> </a-spin
            ></a-tab-pane>
          </a-tabs>
        </a-spin>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
const activeKey = ref('1')
import { ref, reactive, onMounted, computed, watchEffect, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Party imports
import axios from 'axios'

// Platform Utils
import { message, Spin, Column, Empty, MenuProps } from 'ant-design-vue'
import { HomeOutlined, FileSearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import MeterGroup from 'primevue/metergroup'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Chart from 'primevue/chart'
import 'primeicons/primeicons.css'
import ProgressBar from 'primevue/progressbar'
import BarChart from '@/components/BarChart.vue'
import ProjectionBarChart from '@/components/ProjectionBarChart.vue'
import ProjectionPercentColumn from '@/components/ProjectionPercentColumn.vue'
import ScatterPlot from '@/components/ScatterPlot.vue'
import RadarChart from '@/components/RadarChart.vue'
import OverallScatterPlot from '@/components/OverallScatterPlot.vue'

const bchartData = ref([])
const scatterPlotData = ref([])
const projectionBarChartData = ref([])
const projectionPercentColumnData = ref([])
// const radarChartData = ref([])

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'
import { getCellStyle } from '../utils/dynamicColorTable'
import { sleep } from '../utils/delay'

// Sourec image imports
import fnLogo from '@/assets/sourceLogos/fn.png'
import ktcLogo from '@/assets/sourceLogos/ktc.png'
import dpLogo from '@/assets/sourceLogos/dp.png'
import fcLogo from '@/assets/sourceLogos/fc.png'
import ddLogo from '@/assets/sourceLogos/dd.svg'

const route = useRoute()
const router = useRouter()

const leagueName = route.params.leagueName
const leagueYear = route.params.leagueYear
const leagueId = route.params.leagueId
const userName = route.params.userName
const guid = route.params.guid
const platform = route.params.platform
const rankType = route.params.rankType
const userId = route.params.userId
const rosterType = route.params.rosterType
const avatar = route.params.avatar
const leagueType = route.params.leagueType
const apiSource = route.params.platform
const leagueStarters = route.params.leagueStarters
const leagueSize = route.params.leagueSize

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
const apiUrl = import.meta.env.VITE_API_URL

// league information
const leagueInfo = reactive({
  leagueName: leagueName as string,
  leagueId: leagueId as string,
  userName: userName,
  leagueYear: leagueYear,
  guid: guid as string,
  rankType: rankType as string,
  platform: platform as string,
  userId: userId as string,
  rosterType: rosterType as string,
  avatar: avatar as string,
  leagueType: leagueType as string,
  apiSource: apiSource as string
})

const summaryData = ref([])
const detailData = ref([{}])
const projDetailData = ref([{}])
const projSummaryData = ref([{}])
const tradesDetailData = ref([{}])
const tradesSummaryData = ref([{}])
const bestAvailableData = ref([{}])
const selectedUser = ref(null)
const selectedUserId = ref(null)

const leaguesUrl = `/leagues/${leagueYear}/${userName}/${guid}`

const isLoading = ref(false)
const baIsLoading = ref(false)
const summaryIsLoading = ref(false)
const detailIsLoading = ref(false)
const isProjectionLoading = ref(false)
const isTradesLoading = ref(false)
const clickedManager = ref('')

const value1 = ref('espn')
const overallFilter = ref('all')

const filteredData = computed(() => {
  if (overallFilter.value === 'all') {
    return detailData.value
  } else {
    return detailData.value.filter((item) => {
      return item.fantasy_designation === overallFilter.value
    })
  }
})

const updateBchartData = (rawData) => {
  bchartData.value = rawData.flatMap((item) => {
    // Start with an array containing all positions except 'Picks'
    const data = [
      {
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: overallFilter.value === 'all' ? item.qb_sum : item.qb_starter_sum,
        position: 'QB',
        rank: overallFilter.value === 'all' ? item.qb_rank : item.qb_starter_rank
      },
      {
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: overallFilter.value === 'all' ? item.rb_sum : item.rb_starter_sum,
        position: 'RB',
        rank: overallFilter.value === 'all' ? item.rb_rank : item.rb_starter_rank
      },
      {
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: overallFilter.value === 'all' ? item.wr_sum : item.wr_starter_sum,
        position: 'WR',
        rank: overallFilter.value === 'all' ? item.wr_rank : item.wr_starter_rank
      },
      {
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: overallFilter.value === 'all' ? item.te_sum : item.te_starter_sum,
        position: 'TE',
        rank: overallFilter.value === 'all' ? item.te_rank : item.te_starter_rank
      }
    ]

    // Add 'Picks' only if overallFilter is set to 'all'
    if (overallFilter.value === 'all') {
      data.push({
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: item.picks_sum,
        position: 'Picks',
        rank: item.picks_rank
      })
    }

    return data
  })
}

const updateProjectionData = (rawData) => {
  projectionBarChartData.value = rawData.flatMap((item) => {
    const data = [
      {
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: overallFilter.value === 'all' ? item.qb_sum : item.qb_starter_sum,
        position: 'QB',
        rank: overallFilter.value === 'all' ? item.qb_rank : item.qb_starter_rank
      },
      {
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: overallFilter.value === 'all' ? item.rb_sum : item.rb_starter_sum,
        position: 'RB',
        rank: overallFilter.value === 'all' ? item.rb_rank : item.rb_starter_rank
      },
      {
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: overallFilter.value === 'all' ? item.wr_sum : item.wr_starter_sum,
        position: 'WR',
        rank: overallFilter.value === 'all' ? item.wr_rank : item.wr_starter_rank
      },
      {
        display_name:
          item.display_name.length > 8 ? item.display_name.slice(0, 8) + '...' : item.display_name,
        value: overallFilter.value === 'all' ? item.te_sum : item.te_starter_sum,
        position: 'TE',
        rank: overallFilter.value === 'all' ? item.te_rank : item.te_starter_rank
      }
    ]

    return data
  })
}

const updateScatterPlotData = (rawData) => {
  scatterPlotData.value = rawData.flatMap((item) => {
    // Define the positions that will be included in the scatter plot
    const positions = ['QB', 'RB', 'WR', 'TE']

    // Map over each position to create a data entry for the scatter plot
    const data = positions.map((position) => {
      // Define the suffix for properties based on the overallFilter
      const suffix = overallFilter.value === 'all' ? '' : '_starter'

      return {
        Manager: item.display_name,
        Value: item[`${position.toLowerCase()}${suffix}_average_value`], // Total value of the position
        Age: item[`${position.toLowerCase()}${suffix}_average_age`], // Conditionally use starter or regular average age
        position: position,
        rank: item[`${position.toLowerCase()}${suffix}_rank`] // Use rank based on the filter
      }
    })

    return data
  })
}

// const mergedData = computed(() => {
//   return summaryData.value
//     .map((summaryItem) => {
//       const projection = projSummaryData.value.find(
//         (projItem) => projItem.user_id === summaryItem.user_id
//       )
//       if (projection) {
//         // Rename projection fields to include a prefix or suffix
//         return {
//           ...summaryItem,
//           qb_projection: projection.qb_value,
//           rb_projection: projection.rb_value,
//           wr_projection: projection.wr_value,
//           te_projection: projection.te_value,
//           ...projection
//         }
//       }
//       return summaryItem
//     })
//     .filter((item) => item && item.user_id === leagueInfo.userId) // Filter for the specific user
// })

// const radarChartData = computed(() => {
//   if (mergedData.value.length > 0) {
//     const user = mergedData.value[0] // Since it should only be one user's data after the filter
//     return [
//       { position: 'QB', metric: 'Value', value: user.qb_value },
//       { position: 'RB', metric: 'Value', value: user.rb_value },
//       { position: 'WR', metric: 'Value', value: user.wr_value },
//       { position: 'TE', metric: 'Value', value: user.te_value },
//       { position: 'QB', metric: 'Projection', value: user.qb_projection },
//       { position: 'RB', metric: 'Projection', value: user.rb_projection },
//       { position: 'WR', metric: 'Projection', value: user.wr_projection },
//       { position: 'TE', metric: 'Projection', value: user.te_projection }
//     ]
//   }
//   return [] // Return an empty array if no data matches
// })

const OverallScatterPlotData = computed(() => {
  const suffix = overallFilter.value === 'all' ? 'total_value' : 'starters_value'

  const mergedData = summaryData.value
    .map((summaryItem) => {
      const projection = projSummaryData.value.find(
        (projItem) => projItem.user_id === summaryItem.user_id
      )
      return projection
        ? {
            display_name: summaryItem.display_name,
            summaryValue: summaryItem[suffix],
            projValue: projection[suffix]
          }
        : null
    })
    .filter((item) => item !== null)

  return mergedData.map((item) => ({
    Value: item.summaryValue,
    Projection: item.projValue,
    Manager: item.display_name
  }))
})

function getRank(user) {
  return addOrdinalSuffix(overallFilter.value === 'all' ? user.total_rank : user.starters_rank)
}
const sortedSummaryData = computed(() => {
  if (summaryData.value.length === 0) return []

  return [...summaryData.value].sort((a, b) => {
    if (overallFilter.value === 'all') {
      return a.total_rank - b.total_rank
    } else if (overallFilter.value === 'STARTER') {
      return a.starters_rank - b.starters_rank
    }
  })
})

watch(overallFilter, () => {
  // Assuming you have a way to call fetchSummaryData or just update the relevant parts
  if (summaryData.value.length) {
    updateBchartData(summaryData.value)
    updateScatterPlotData(summaryData.value)
  }
  if (summaryData.value.length) {
    updateProjectionData(projSummaryData.value)
  }
})

const sources = [
  { key: 'sf', name: 'FantasyNavigator', logo: fnLogo },
  { key: 'ktc', name: 'KeepTradeCut', logo: ktcLogo },
  { key: 'dp', name: 'DynastyProcess', logo: dpLogo },
  { key: 'fc', name: 'FantasyCalc', logo: fcLogo },
  { key: 'dd', name: 'DynastyDaddy', logo: ddLogo }
]
const source = ref(platform)
const selectedSource = ref(sources.find((source) => source.key === platform) || sources[0])

const filteredSources = computed(() => {
  if (leagueInfo.rankType !== 'Dynasty') {
    return sources.filter(
      (source) => source.key === 'fc' || source.key === 'ktc' || source.key === 'sf'
    )
  }
  return sources
})

const props = defineProps({
  detailData: Array
})

const handleMenuClick: MenuProps['onClick'] = (e) => {
  const leagueId = leagueInfo.leagueId
  const leagueYear = leagueInfo.leagueYear
  const platform = e.key
  try {
    fetchSummaryData(leagueId, platform, rankType, guid, rosterType)
    fetchDetailData(leagueId, platform, rankType, guid, rosterType)
    fetchBaData(leagueId, platform, rankType, guid, rosterType)
    fetchTrades(leagueId, platform, rosterType, leagueYear, rankType)
    selectedSource.value = sources.find((source) => source.key === platform) || sources[0]
  } catch {
    console.log('error loading leagues')
  } finally {
    console.log('league ranks pull complete')
  }
}

const handleProjChange = async (projectionSource: any) => {
  isProjectionLoading.value = true
  try {
    const [summaryResponse, detailResponse] = await Promise.all([
      axios.get(`${apiUrl}/contender_league_summary`, {
        params: {
          league_id: leagueId,
          projection_source: projectionSource,
          guid: guid
        }
      }),
      axios.get(`${apiUrl}/contender_league_detail`, {
        params: {
          league_id: leagueId,
          projection_source: projectionSource,
          guid: guid
        }
      })
    ])
    const projectionDetailData = detailResponse.data
    projDetailData.value = projectionDetailData

    projSummaryData.value = summaryResponse.data.map((item) => {
      return {
        ...item,
        total_rank_display: addOrdinalSuffix(item.total_rank),
        starters_rank_display: addOrdinalSuffix(item.starters_rank),
        qb_rank_display: addOrdinalSuffix(item.qb_rank),
        rb_rank_display: addOrdinalSuffix(item.rb_rank),
        wr_rank_display: addOrdinalSuffix(item.wr_rank),
        te_rank_display: addOrdinalSuffix(item.te_rank)
      }
    })

    const rawData = summaryResponse.data
    updateProjectionData(rawData)
    projDetailData.value = detailResponse.data

    projSummaryData.value = summaryResponse.data.map((item) => {
      return {
        ...item,
        total_rank_display: addOrdinalSuffix(item.total_rank),
        starters_rank_display: addOrdinalSuffix(item.starters_rank),
        qb_rank_display: addOrdinalSuffix(item.qb_rank),
        rb_rank_display: addOrdinalSuffix(item.rb_rank),
        wr_rank_display: addOrdinalSuffix(item.wr_rank),
        te_rank_display: addOrdinalSuffix(item.te_rank)
      }
    })

    projectionPercentColumnData.value = summaryResponse.data.map((item) => {
      return {
        display_name: item.display_name,
        starters_sum: item.starters_sum, // Ensure this data is provided by your API
        bench_sum: item.bench_sum // Ensure this data is provided by your API
      }
    })
  } catch (error) {
    console.error('Error calling internal API:', error)
  } finally {
    isProjectionLoading.value = false
  }
}

const positionTitles = {
  QB: 'Quarterbacks',
  RB: 'Runningbacks',
  WR: 'Wide Receivers',
  TE: 'Tight Ends',
  PICKS: 'Picks'
}

function formatGaugeData(record) {
  // Assuming overallFilter is a reactive ref and accessible here
  const overallFilterValue = overallFilter.value
  const isAll = overallFilterValue === 'all'
  console.log('overallFilterValue', overallFilterValue)

  // Make sure to define or fetch the total value if it's not provided in the record
  const totalValue = record.total_value // Assuming total_value is defined on the record for 'all'
  const starterValue = record.starters_sum // Assuming starters_value is defined on the record for 'starters'

  return [
    {
      label: `QB: ${isAll ? record.qb_sum.toLocaleString() : record.qb_starters_sum.toLocaleString()}`,
      color: 'rgb(39, 125, 161)',
      value: isAll
        ? (record.qb_sum / totalValue) * 100
        : (record.qb_starter_sum / record.starters_sum) * 100
    },
    {
      label: `RB: ${isAll ? record.rb_sum.toLocaleString() : record.rb_starters_sum.toLocaleString()}`,
      color: 'rgb(144, 190, 109)',
      value: isAll
        ? (record.rb_sum / totalValue) * 100
        : (record.rb_starter_sum / record.starters_sum) * 100
    },
    {
      label: `WR: ${isAll ? record.wr_sum.toLocaleString() : record.wr_startes_sum.toLocaleString()}`,
      color: 'rgb(67, 170, 139)',
      value: isAll
        ? (record.wr_sum / totalValue) * 100
        : (record.wr_starter_sum / record.starters_sum) * 100
    },
    {
      label: `TE: ${isAll ? record.te_sum.toLocaleString() : record.te_starters_sum.toLocaleString()}`,
      color: 'rgb(249, 132, 74)',
      value: isAll
        ? (record.te_sum / totalValue) * 100
        : (record.te_starter_sum / record.starters_sum) * 100
    },
    // Include the Picks data only when viewing 'all'
    ...(isAll
      ? [
          {
            label: `Picks: ${record.picks_sum.toLocaleString()}`,
            color: 'rgba(189, 195, 199, 0.6)',
            value: (record.picks_value / totalValue) * 100
          }
        ]
      : [])
  ]
}

const starterColumns: Column[] = [
  {
    title: '',
    dataIndex: 'display_name',
    key: 'display_name',
    align: 'left'
  },
  {
    title: 'Starters',
    dataIndex: 'starters_rank_display',
    key: 'starters_rank_display',
    align: 'center',
    width: 100,
    slots: { customRender: 'starterValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.starters_rank)
    }),
    sorter: {
      compare: (a, b) => a.starters_rank - b.starters_rank
    }
  },

  {
    title: 'QB',
    dataIndex: 'qb_starter_rank_display',
    key: 'qb_starter_rank',
    align: 'center',
    width: 100,
    slots: { customRender: 'qbStarterValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.qb_starter_rank)
    }),
    sorter: {
      compare: (a, b) => a.qb_starter_rank - b.qb_starter_rank
    }
  },
  {
    title: 'RB',
    dataIndex: 'rb_starter_rank_display',
    key: 'rb_starter_rank',
    align: 'center',
    width: 100,
    slots: { customRender: 'rbStarterValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.rb_starter_rank)
    }),
    sorter: {
      compare: (a, b) => a.rb_starter_rank - b.rb_starter_rank
    }
  },
  {
    title: 'WR',
    dataIndex: 'wr_starter_rank_display',
    key: 'wr_starter_rank',
    align: 'center',
    width: 100,
    slots: { customRender: 'wrStarterValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.wr_starter_rank)
    }),
    sorter: {
      compare: (a, b) => a.wr_starter_rank - b.wr_starter_rank
    }
  },
  {
    title: 'TE',
    dataIndex: 'te_starter_rank_display',
    key: 'te_starter_rank',
    align: 'center',
    width: 100,
    slots: { customRender: 'teStarterValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.te_starter_rank)
    }),
    sorter: {
      compare: (a, b) => a.te_starter_rank - b.te_starter_rank
    }
  }
]
const tradeColumns: Column[] = [
  {
    title: '',
    dataIndex: 'display_name',
    key: 'display_name'
  },
  {
    title: 'Trades Cnt',
    dataIndex: 'trades_cnt',
    key: 'trades_cnt',
    align: 'center',
    sorter: {
      compare: (a, b) => a.trades_cnt - b.trades_cnt
    }
  },
  {
    title: 'Added',
    dataIndex: 'total_add',
    key: 'total_add',
    sorter: {
      compare: (a, b) => a.total_add - b.total_add
    }
  },
  {
    title: 'Lost',
    dataIndex: 'total_drop',
    key: 'total_drop',
    sorter: {
      compare: (a, b) => a.total_drop - b.total_drop
    }
  },
  {
    title: 'Net',
    dataIndex: 'total_diff',
    key: 'total_diff',
    sorter: {
      compare: (a, b) => a.total_diff - b.total_diff
    }
  }
]
const columns = computed(() => {
  // Define base columns common to all views
  let baseColumns = [
    {
      title: '',
      dataIndex: 'display_name',
      key: 'display_name',
      align: 'left',
      width: 1
    },
    {
      title: overallFilter.value === 'all' ? 'Overall' : 'Starters',
      dataIndex: overallFilter.value === 'all' ? 'total_rank' : 'starters_rank',
      key: 'overall_rank',
      align: 'center',
      customRender: ({ record }) =>
        `${addOrdinalSuffix(overallFilter.value === 'all' ? record.total_rank : record.starters_rank)}`,
      sorter: (a, b) =>
        overallFilter.value === 'all'
          ? a.total_rank - b.total_rank
          : a.starters_rank - b.starters_rank,
      customCell: (record) => ({
        style: getCellStyle(
          overallFilter.value === 'all' ? record.total_rank : record.starters_rank
        )
      })
    },
    // Map over positions, skipping Picks and Bench when not 'all'
    ...['QB', 'RB', 'WR', 'TE'].map((position) => ({
      title: position,
      dataIndex:
        overallFilter.value === 'all'
          ? `${position.toLowerCase()}_rank`
          : `${position.toLowerCase()}_starter_rank`,
      key: `${position.toLowerCase()}_rank`,
      align: 'center',
      customRender: ({ record }) =>
        `${addOrdinalSuffix(record[overallFilter.value === 'all' ? `${position.toLowerCase()}_rank` : `${position.toLowerCase()}_starter_rank`])}`,
      sorter: (a, b) =>
        a[
          overallFilter.value === 'all'
            ? `${position.toLowerCase()}_rank`
            : `${position.toLowerCase()}_starter_rank`
        ] -
        b[
          overallFilter.value === 'all'
            ? `${position.toLowerCase()}_rank`
            : `${position.toLowerCase()}_starter_rank`
        ],
      customCell: (record) => ({
        style: getCellStyle(
          record[
            overallFilter.value === 'all'
              ? `${position.toLowerCase()}_rank`
              : `${position.toLowerCase()}_starter_rank`
          ]
        )
      })
    }))
  ]

  // Add Picks and Bench only if 'all'
  if (overallFilter.value === 'all') {
    baseColumns = baseColumns.concat([
      {
        title: 'Picks',
        dataIndex: 'picks_rank',
        key: 'picks_rank',
        align: 'center',
        customRender: ({ record }) => `${addOrdinalSuffix(record.picks_rank)}`,
        sorter: (a, b) => a.picks_rank - b.picks_rank,
        customCell: (record) => ({
          style: getCellStyle(record.picks_rank)
        })
      },
      {
        title: 'Bench',
        dataIndex: 'bench_rank',
        key: 'bench_rank',
        align: 'center',
        customRender: ({ record }) => `${addOrdinalSuffix(record.bench_rank)}`,
        sorter: (a, b) => a.bench_rank - b.bench_rank,
        customCell: (record) => ({
          style: getCellStyle(record.bench_rank)
        })
      }
    ])
  }

  return baseColumns
})

const projColumns: Column[] = [
  {
    title: '',
    dataIndex: 'display_name',
    key: 'display_name',
    align: 'left',
    width: 1
  },

  {
    title: 'Overall',
    dataIndex: 'total_rank_display',
    key: 'total_rank_display',
    align: 'center',
    slots: { customRender: 'totalValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.total_rank)
    }),
    sorter: {
      compare: (a, b) => a.total_rank - b.total_rank
    }
  },
  {
    title: 'Starters',
    dataIndex: 'starters_rank_display',
    key: 'starter_rank_display',
    align: 'center',
    slots: { customRender: 'totalValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.starters_rank)
    }),
    sorter: {
      compare: (a, b) => a.starters_rank - b.starters_rank
    }
  },
  {
    title: 'QB',
    dataIndex: 'qb_rank_display',
    key: 'qb_rank',
    align: 'center',
    slots: { customRender: 'qbValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.qb_rank)
    }),
    sorter: {
      compare: (a, b) => a.qb_rank - b.qb_rank
    }
  },
  {
    title: 'RB',
    dataIndex: 'rb_rank_display',
    key: 'rb_rank',
    align: 'center',
    slots: { customRender: 'rbValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.rb_rank)
    }),
    sorter: {
      compare: (a, b) => a.rb_rank - b.rb_rank
    }
  },
  {
    title: 'WR',
    dataIndex: 'wr_rank_display',
    key: 'wr_rank',
    align: 'center',
    slots: { customRender: 'wrValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.wr_rank)
    }),
    sorter: {
      compare: (a, b) => a.wr_rank - b.wr_rank
    }
  },
  {
    title: 'TE',
    dataIndex: 'te_rank_display',
    key: 'te_rank',
    align: 'center',
    slots: { customRender: 'teValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.te_rank)
    }),
    sorter: {
      compare: (a, b) => a.te_rank - b.te_rank
    }
  }
  // Add more columns as needed
]

onMounted(() => {
  const leagueId = route.params.leagueId as string
  const leagueYear = route.params.leagueYear as string
  const platform = route.params.platform as string
  const rankType = route.params.rankType as string
  const guid = route.params.guid as string
  const rosterType = route.params.rosterType as string
  const userId = route.params.userId as string
  if (leagueId && platform && rankType && guid && userId) {
    insertLeagueDetials()
  }
})

function getPositionColor(position: string): string {
  if (position === 'QB') {
    return 'rgb(39, 125, 161)'
  } else if (position === 'RB') {
    return 'rgb(144, 190, 109)'
  } else if (position === 'WR') {
    return 'rgb(67, 170, 139)'
  } else if (position === 'TE') {
    return 'rgb(249, 132, 74)'
  } else if (position.toUpperCase() === 'PICKS') {
    return 'rgb(70, 70, 70,.625)'
  } else {
    return 'rgb(0, 0, 0, .00)'
  }
}

function getHeaderColor(position: string): string {
  if (position === 'QB') {
    return 'rgb(39, 125, 161, .25)'
  } else if (position === 'RB') {
    return 'rgb(144, 190, 109, .25)'
  } else if (position === 'WR') {
    return 'rgb(67, 170, 139, .25)'
  } else if (position === 'TE') {
    return 'rgb(249, 132, 74, .25)'
  } else if (position.toUpperCase() === 'PICKS') {
    return 'rgb(70, 70, 70, .25)'
  } else {
    return 'rgb(0, 0, 0, .00)'
  }
}

function getPositionTag(position, opacity = 0.15) {
  switch (position) {
    case 'QB':
      return {
        color: `rgb(39, 125, 161)`,
        background: `rgba(39, 125, 161, ${opacity})`,
        'border-color': `rgb(39, 125, 161)`,
        border: `1px solid rgba(39, 125, 161, ${opacity})`
      }
    case 'RB':
      return {
        color: `rgb(144, 190, 109)`,
        background: `rgba(144, 190, 109, ${opacity})`,
        'border-color': `rgb(144, 190, 109)`,
        border: `1px solid rgba(144, 190, 109, ${opacity})`
      }
    case 'WR':
      return {
        color: `rgb(67, 170, 139)`,
        background: `rgba(67, 170, 139, ${opacity})`,
        'border-color': `rgb(67, 170, 139)`,
        border: `1px solid rgba(67, 170, 139, ${opacity})`
      }
    case 'TE':
      return {
        color: `rgb(249, 132, 74)`,
        background: `rgba(249, 132, 74, ${opacity})`,
        'border-color': `rgb(249, 132, 74)`,
        border: `1px solid rgba(249, 132, 74, ${opacity})`
      }
    case 'PICKS':
      return {
        color: `rgb(143, 145, 146)`,
        background: `rgba(143, 145, 146, ${opacity})`,
        'border-color': `rgb(143, 145, 146)`,
        border: `1px solid rgba(143, 145, 146, ${opacity})`
      }
    default:
      return {}
  }
}

function getPositionTagList(position, opacity = 0.15) {
  switch (position) {
    case 'QB':
      return {
        background: `rgba(39, 125, 161, ${opacity})`,
        'border-color': `rgb(39, 125, 161)`,
        border: `1px solid rgba(39, 125, 161, ${opacity})`
      }
    case 'RB':
      return {
        background: `rgba(144, 190, 109, ${opacity})`,
        'border-color': `rgb(144, 190, 109)`,
        border: `1px solid rgba(144, 190, 109, ${opacity})`
      }
    case 'WR':
      return {
        background: `rgba(67, 170, 139, ${opacity})`,
        'border-color': `rgb(67, 170, 139)`,
        border: `1px solid rgba(67, 170, 139, ${opacity})`
      }
    case 'TE':
      return {
        background: `rgba(249, 132, 74, ${opacity})`,
        'border-color': `rgb(249, 132, 74)`,
        border: `1px solid rgba(249, 132, 74, ${opacity})`
      }
    case 'PICKS':
      return {
        background: `rgba(143, 145, 146, ${opacity})`,
        'border-color': `rgb(143, 145, 146)`,
        border: `1px solid rgba(143, 145, 146, ${opacity})`
      }
    default:
      return {}
  }
}

// Compute chunks of 50 players
const playerChunks = computed(() => {
  const size = 50
  return filteredData.value.reduce((acc, val, i) => {
    let idx = Math.floor(i / size)
    let page = acc[idx] || (acc[idx] = [])
    page.push(val)
    return acc
  }, [])
})

const starterSummaryData = computed(() => {
  return [...summaryData.value].sort((a, b) => a.starters_rank - b.starters_rank)
})

const getPlayers = (userId) => {
  const interimData = filteredData.value.filter((item) => item.user_id === userId)
  return interimData
}

const getAllPlayers = (userId) => {
  const interimData = detailData.value.filter((item) => item.user_id === userId)
  return interimData
}

const getPlayersProj = (userId) => {
  const interimProjData = projDetailData.value.filter((item) => item.user_id === userId)
  return interimProjData
}

const insertLeagueDetials = async (values: any) => {
  isLoading.value = true
  detailIsLoading.value = true
  summaryIsLoading.value = true
  console.log('trying insert rosters')

  try {
    const response = await axios.post(`${apiUrl}/roster`, {
      league_id: leagueInfo.leagueId,
      user_id: leagueInfo.userId,
      guid: leagueInfo.guid,
      league_year: leagueInfo.leagueYear
    })

    console.log('Rosters loading...')
  } catch (error) {
    console.error('Error loading rosters', error)
  } finally {
    isLoading.value = false // Update loading state

    fetchSummaryData(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rankType,
      leagueInfo.guid,
      leagueInfo.rosterType
    )
    fetchDetailData(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rankType,
      leagueInfo.guid,
      leagueInfo.rosterType
    )
    fetchBaData(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rankType,
      leagueInfo.guid,
      leagueInfo.rosterType
    )
    fetchTrades(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rosterType,
      leagueInfo.leagueYear,
      leagueInfo.rankType
    )
    fetchProjectionData(leagueInfo.leagueId, value1.value, leagueInfo.guid)
  }
}

async function fetchProjectionData(leagueId: string, projectionSource: string, guid: string) {
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 2000 // Delay in milliseconds

  while (retryCount < maxRetries) {
    try {
      console.log('Fetching projection data...')
      const [summaryResponse, detailResponse] = await Promise.all([
        axios.get(`${apiUrl}/contender_league_summary`, {
          params: { league_id: leagueId, projection_source: projectionSource, guid: guid }
        }),
        axios.get(`${apiUrl}/contender_league_detail`, {
          params: { league_id: leagueId, projection_source: projectionSource, guid: guid }
        })
      ])

      updateProjectionData(summaryResponse.data) // Assuming this function processes and updates some state or UI
      projDetailData.value = detailResponse.data

      projSummaryData.value = summaryResponse.data.map((item) => {
        return {
          ...item,
          total_rank_display: addOrdinalSuffix(item.total_rank),
          starters_rank_display: addOrdinalSuffix(item.starters_rank),
          qb_rank_display: addOrdinalSuffix(item.qb_rank),
          rb_rank_display: addOrdinalSuffix(item.rb_rank),
          wr_rank_display: addOrdinalSuffix(item.wr_rank),
          te_rank_display: addOrdinalSuffix(item.te_rank)
        }
      })

      projectionPercentColumnData.value = summaryResponse.data.map((item) => {
        return {
          display_name: item.display_name,
          starters_sum: item.starters_sum, // Ensure this data is provided by your API
          bench_sum: item.bench_sum // Ensure this data is provided by your API
        }
      })

      console.log('Projection data fetched successfully.')
      return // Exit the function after successful fetch
    } catch (error) {
      console.error('Error fetching projection data:', error)
      retryCount++
      if (retryCount < maxRetries) {
        console.log(`Retrying... Attempt ${retryCount}`)
        await sleep(retryDelay)
      }
    }
  }

  // If retries are exhausted and no successful fetch, handle the error:
  console.error('Failed to fetch projection data after retries.')
  message.error('Failed to fetch projection data. Please try again later.')
  isProjectionLoading.value = false
}

async function fetchSummaryData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string,
  leagueType: string // Assuming this is defined somewhere as it's used in your params
) {
  summaryIsLoading.value = true
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500 // Delay in milliseconds

  try {
    while (retryCount < maxRetries) {
      try {
        const response = await axios.get(`${apiUrl}/league_summary`, {
          params: {
            league_id: leagueId,
            platform: platform,
            rank_type: rankType,
            guid: guid,
            roster_type: rosterType,
            league_type: leagueType
          }
        })

        const rawData = response.data

        summaryData.value = rawData.map((item) => {
          return {
            ...item,
            total_rank_display: addOrdinalSuffix(item.total_rank),
            // other mappings...
            picks_percent: (item.picks_sum / item.total_value) * 100
          }
        })

        updateBchartData(rawData)
        updateScatterPlotData(rawData)
        break // Exit the loop on success
      } catch (error) {
        console.error('Error fetching league summary data:', error.message)
        retryCount++
        if (retryCount < maxRetries) {
          console.log(`Retrying... Attempt ${retryCount}`)
          await sleep(retryDelay)
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch league summary data. Please try again later.')
  } finally {
    summaryIsLoading.value = false
  }

  if (retryCount === maxRetries) {
    console.error('Maximum retries reached for fetching league summary data')
    // handle the max retry limit being reached as needed
  }
}

async function fetchBaData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string
) {
  baIsLoading.value = true // Assuming you have a reactive variable to track loading state
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500 // Delay in milliseconds

  while (retryCount < maxRetries) {
    try {
      const response = await axios.get(`${apiUrl}/best_available`, {
        params: {
          league_id: leagueId,
          platform: platform,
          rank_type: rankType,
          guid: guid,
          roster_type: rosterType
        }
      })

      bestAvailableData.value = response.data
      console.log('Best available data fetched successfully.')
      return // Exit the function after successful fetch
    } catch (error) {
      console.error('There was an error fetching the best available data:', error)
      retryCount++
      if (retryCount < maxRetries) {
        console.log(`Retrying... Attempt ${retryCount}`)
        await sleep(retryDelay)
      }
    }
  }

  // If retries are exhausted and no successful fetch, handle the error:
  console.error('Failed to fetch best available data after retries.')
  message.error('Failed to fetch best available data. Please try again later.')
  baIsLoading.value = false // Ensure loading is turned off
}

async function fetchTrades(
  leagueId: string,
  platform: string,
  rosterType: string,
  leagueYear: string,
  rankType: string
) {
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500 // Delay in milliseconds

  while (retryCount < maxRetries) {
    try {
      console.log('Pulling trades')
      const [summaryResponse, detailResponse] = await Promise.all([
        axios.get(`${apiUrl}/trades_summary`, {
          params: {
            league_id: leagueId,
            platform: platform,
            roster_type: rosterType,
            league_year: leagueYear,
            rank_type: rankType
          }
        }),
        axios.get(`${apiUrl}/trades_detail`, {
          params: {
            league_id: leagueId,
            platform: platform,
            roster_type: rosterType,
            league_year: leagueYear,
            rank_type: rankType
          }
        })
      ])

      tradesSummaryData.value = summaryResponse.data
      tradesDetailData.value = detailResponse.data
      console.log('Trade data fetched successfully.')
      return // Exit the function after successful fetch
    } catch (error) {
      console.error('There was an error fetching the trades data:', error)
      retryCount++
      if (retryCount < maxRetries) {
        console.log(`Retrying... Attempt ${retryCount}`)
        await sleep(retryDelay)
      }
    }
  }

  // If retries are exhausted and no successful fetch, handle the error:
  console.error('Failed to fetch trade data after retries.')
  message.error('Failed to fetch trade data. Please try again later.')
}

const leagueOwnerData = computed(() => {
  const ownerData = summaryData.value
    .map(({ total_value, ...rest }) => rest)
    .find((item) => item.user_id === userId)
  const leagueSize = summaryData.value.reduce((max, item) => Math.max(max, item.total_rank), 0)
  const qbMaxValue = summaryData.value.reduce((max, item) => Math.max(max, item.qb_sum), 0)
  const rbMaxValue = summaryData.value.reduce((max, item) => Math.max(max, item.rb_sum), 0)
  const wrMaxValue = summaryData.value.reduce((max, item) => Math.max(max, item.wr_sum), 0)
  const teMaxValue = summaryData.value.reduce((max, item) => Math.max(max, item.te_sum), 0)
  const picksMaxValue = summaryData.value.reduce((max, item) => Math.max(max, item.picks_sum), 0)
  const qbStarterMaxValue = summaryData.value.reduce(
    (max, item) => Math.max(max, item.qb_starter_sum),
    0
  )
  const rbStarterMaxValue = summaryData.value.reduce(
    (max, item) => Math.max(max, item.rb_starter_sum),
    0
  )
  const wrStarterMaxValue = summaryData.value.reduce(
    (max, item) => Math.max(max, item.wr_starter_sum),
    0
  )
  const teStarterMaxValue = summaryData.value.reduce(
    (max, item) => Math.max(max, item.te_starter_sum),
    0
  )

  return {
    ...ownerData,
    league_size: leagueSize,
    qb_max_value: qbMaxValue,
    rb_max_value: rbMaxValue,
    wr_max_value: wrMaxValue,
    te_max_value: teMaxValue,
    picks_max_value: picksMaxValue,
    qb_max_starter_value: qbStarterMaxValue,
    rb_max_starter_value: rbStarterMaxValue,
    wr_max_starter_value: wrStarterMaxValue,
    te_max_starter_value: teStarterMaxValue
  }
})

const getLeagueSummary = async (values: any) => {
  try {
    console.log('attempt get league summary')

    const url = `/leaguesummary/${userName}/${userId}/${leagueId}/${leagueName}/${leagueYear}/${leagueStarters}/${leagueSize}/${rosterType}/${guid}/${rosterType}/${avatar}/${rankType}`

    router.push(url)
  } catch (error) {
    console.error('Failed to load league details:', error)
  } finally {
    console.log('complete')
  }
}

const chartOptions = computed(() => {
  return {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = context.raw
            return `${dataPoint.label} Age:${dataPoint.x} Value:${dataPoint.y}`
          }
        }
      }
    },
    scales: {
      x: {
        min: 20,
        max: 40,
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        min: 0,
        max: 9999,
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  }
})

const starterData = computed(() => {
  return detailData.value.filter((item) => item.fantasy_designation === 'STARTER')
})

const groupedPlayers = computed(() => {
  return bestAvailableData.value.reduce((acc, player) => {
    if (!acc[player.player_position]) {
      acc[player.player_position] = []
    }
    acc[player.player_position].push(player)
    return acc
  }, {})
})

async function fetchDetailData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string
) {
  detailIsLoading.value = true
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500 // delay in milliseconds

  while (retryCount < maxRetries) {
    try {
      const response = await axios.get(`${apiUrl}/league_detail`, {
        params: {
          league_id: leagueId,
          platform: platform,
          rank_type: rankType,
          guid: guid,
          roster_type: rosterType
        }
      })

      detailData.value = response.data
      break
    } catch (error) {
      console.error('Error fetching league detail data:', error.message)
      retryCount++
      if (retryCount < maxRetries) {
        console.log(`Retrying... Attempt ${retryCount}`)
        await sleep(retryDelay)
      } else {
        message.error('Failed to fetch league detail data. Please try again later.')
      }
    }
  }
  detailIsLoading.value = false
}

function handleUserClick(user) {
  clickedManager.value = clickedManager.value === user.display_name ? '' : user.display_name
  if (selectedUser.value && selectedUser.value.user_id === user.user_id) {
    selectedUser.value = null
  } else {
    selectedUser.value = user // Set the selectedUser to the clicked user
  }
}

function avatarStyle(user) {
  return {
    border: selectedUserId.value === user.user_id ? '2px solid red' : 'none'
  }
}
const playersByPosition = computed(() => {
  const order = ['QB', 'RB', 'WR', 'TE', 'PICKS'] // Define the order of positions
  const groups = {}

  // Initialize the groups object with keys in the desired order
  order.forEach((position) => {
    groups[position] = []
  })

  // Populate the groups object with players
  filteredData.value.forEach((player) => {
    if (groups.hasOwnProperty(player.player_position)) {
      groups[player.player_position].push(player)
    }
  })

  // Filter out any positions that end up being empty to prevent empty categories
  order.forEach((position) => {
    if (groups[position].length === 0) {
      delete groups[position]
    }
  })

  return groups
})
const visualStartPercentage = 20
const max = 100
const min = max - visualStartPercentage // Actual value that corresponds to 20% visually
const actualValue = ref(70) // Change this as needed
const progressBarWidth = computed(() => {
  if (actualValue.value < min) {
    return `${visualStartPercentage}%` // Start at 20%
  } else if (actualValue.value > max) {
    return '100%' // Max out at 100%
  } else {
    // Scale percentage from 20% to 100%
    const scaledValue =
      ((actualValue.value - min) / (max - min)) * (100 - visualStartPercentage) +
      visualStartPercentage
    return `${scaledValue.toFixed(2)}%`
  }
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}
table {
  border-collapse: collapse;
}
.league-info-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background: #fff;
}
.ant-table-tbody > tr {
  border-bottom: 1px solid white;
}

.ant-table-tbody > tr > td {
  color: white;
}

.ant-table-thead > tr > th {
  color: white;
  border-bottom: 2px solid white;
}
.user-progress {
  margin-bottom: 20px;
  width: 350px;
  height: 50px;
  transform: scale(0.8);
  transform-origin: top left;
  margin: 10px;
}

.progress-container {
  position: relative;
}
.median-line {
  bottom: 200;
  width: 20px;
  background-color: red;
}
.overlay-progress {
  position: absolute;
  left: 0;
  top: 0;
  margin-bottom: 10px;
}

.overlay-progress-overall {
  position: absolute;
  width: 85%;
}
.badge-label {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0%);
  background-color: rgb(70, 70, 70);
  color: white;
  padding: 0 4px;
  border-radius: 10px;
}

.progress-container {
  margin: 0 auto;
}
.progress-bars-section-mv {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.progress-bar-group-mv {
  margin: 0 auto;
}

.progress-container-mv {
  max-width: 1000px;
}

.ant-table-tbody {
  padding: 2px 2px;
}
.legend {
  display: flex;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 10px; /* Adjust space between legend items */
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 25%;
  margin-right: 5px;
}

.legend-text {
  font-size: 14px;
}
.table-section {
  display: flex;
  justify-content: center;
}

.chart-container {
  position: relative;
  margin: auto;
  max-width: 1100px;
}
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-container {
  flex-grow: 1;
}

.controls-container {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .controls-container {
    flex-direction: column;
    width: 100%;
  }
}
.responsive-padding {
  padding: 0 10px;
}

@media (min-width: 440px) {
  .responsive-padding {
    padding: 0 100px;
  }
}

.league-logo {
  width: 38px;
  height: 38px;
  border-radius: 7px;
  border: 1px solid gray;
  margin-right: 10px;
}

.league-title {
  display: flex;
  align-items: center;
  justify-content: left;
  flex-wrap: wrap;
  text-align: center;
}
.rank-logos {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
}
.manager-logos {
  width: 328x;
  height: 28px;
  vertical-align: middle;
  border-radius: 50%;
  border: 1px solid gray;
}
.avatar-traded-asset {
  width: 38px;
  height: 32px;
  flex: 0 0 38px;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid rgb(39, 125, 161);
}

.load-league-button {
  max-width: 300px;
}
.no-bullets li {
  list-style-type: none;
}
.highlighted {
  background-color: #f0f2f5;
  border: 1px solid red !important;
  font-weight: bold;
}

.lighter {
  color: #aaa !important;
  opacity: 0.7;
}
.avatar {
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.4);
}
li {
  list-style-type: none;
}
.dimmed-text {
  color: #aaa !important;
}
.gutter-box-dropdown {
  margin-bottom: 10px;
  display: flex;
  justify-content: left;
}
.gutter-box-buttons {
  display: flex;
  justify-content: left;
  margin-top: 10px;
  align-items: baseline;
}
.gutter-box-refresh {
  margin-bottom: 10px;
  display: flex;
  justify-content: right;
  align-items: baseline;
}
.ant-card .ant-card-body {
  padding: 8px !important; /* Reducing padding and using !important to ensure override */
}

.position-card h3 {
  color: #333;
}
.position-card ul {
  padding-left: 20px;
}
.position-card li {
  list-style-type: none;
}
.position-card {
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Optional: Add media queries for finer control */
@media (max-width: 600px) {
  .position-card {
    padding: 10px;
  }
}

.user-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px 4px;
}

.user-info h3,
.user-info p {
  margin: 5px 0;
}

.placeholder {
  text-align: center;
  color: #666;
}
.gutter-box {
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gutter-box-stats {
  padding: 5px 1px;
  display: flex;
  justify-content: center;
  align-content: center;
}
h4 {
  white-space: normal; /* Allows text to wrap */
  word-wrap: break-word; /* Ensures long words do not overflow */
  hyphens: auto; /* Optionally add hyphenation to properly hyphenate words at line breaks */
  overflow-wrap: break-word; /* Ensures the text breaks to prevent overflow */
}
.mirrored-user {
  max-width: 500px;
  margin: 15px 1px;
}
.tab-sub-header {
  text-align: left;
  margin-bottom: 25px;
}
.avatar-group-container {
  margin: 10px;
}
.progress-container {
  height: 20px;
  border-radius: 5px;
}

.progress-bar {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease-in-out;
}
.chart-title {
  text-align: center;
  margin-bottom: 20px; /* Add some space between the title and the chart */
}
.avatar-container {
  border: 1px solid #696969;
  border-radius: 5px;
  background-color: whte;
  display: flex;
  justify-content: center;
  position: relative;
  padding: 5px;
}
.avatar-title {
  position: absolute;
  top: -20px; /* Adjust for overlap */
  right: -30px; /* Position towards the right */
  padding: 0 1px;
  transform: translateX(-50%);
}
.viz-container {
  border: 1px solid #d3d3d3;
  border-radius: 5px;
  padding: 5px;
  margin: 10px 0;
}
</style>
