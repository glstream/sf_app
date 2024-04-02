<template>
  <a-layout class="layout">
    <AppHeader />
    <a-layout-content class="responsive-padding">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item><a href="/username">Home</a></a-breadcrumb-item>
        <a-breadcrumb-item><a :href="leaguesUrl">Leagues</a></a-breadcrumb-item>
        <a-breadcrumb-item>League Details</a-breadcrumb-item>
      </a-breadcrumb>
      <div style="display: flex; justify-content: left">
        <a-avatar-group
          maxCount="12"
          maxPopoverPlacement="bottom"
          maxPopoverTrigger="hover"
          :max-count="12"
        >
          <div v-for="user in summaryData" :key="user.user_id">
            <div
              v-if="user.user_id === leagueInfo.userId"
              style="position: relative; display: inline-block"
            >
              <a-tooltip
                :title="`${addOrdinalSuffix(user.total_rank)} ${user.display_name}`"
                placement="top"
              >
                <a-avatar
                  :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                  maxPopoverTrigger="hover"
                  :size="45"
                  style="border: 2px solid gold"
                />
              </a-tooltip>
              <span class="badge-label">
                {{ addOrdinalSuffix(user.total_rank) }}
              </span>
            </div>

            <div v-else>
              <a-tooltip
                :title="`${addOrdinalSuffix(user.total_rank)} ${user.display_name}`"
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
      <div class="header-container">
        <div class="title-container">
          <h2 class="league-title">
            <img
              class="league-logo"
              :src="`https://sleepercdn.com/avatars/thumbs/${leagueInfo.avatar}`"
              alt="League Logo"
            />
            {{ leagueInfo.leagueName }}

            <a-tag color="cyan" size="large" style="margin-left: 15px">{{ source }}</a-tag>
            <a-tag style="margin-left: 15px">{{ leagueInfo.rosterType }}</a-tag>
            <a-tag style="margin-left: 15px">{{ leagueInfo.rankType }}</a-tag>
          </h2>
        </div>
        <div class="controls-container">
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
          <a-button
            @click="insertLeagueDetials(leagueInfo.leagueId)"
            type="primary"
            class="load-league-button"
          >
            Load League
          </a-button>
        </div>
      </div>
      <a-spin tip="Loading..." :spinning="summaryIsLoading">
        <TabView :scrollable="true">
          <TabPanel header="Overall">
            <h2 style="text-align: left">Power Ranks</h2>
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
                <span
                  class="legend-color"
                  style="background-color: rgba(189, 195, 199, 0.6)"
                ></span>
                <span class="legend-text">Picks</span>
              </div>
            </div>
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
                <template v-slot:customProgressBar="{ record }">
                  <div>
                    <a-progress
                      :percent="
                        record.qb_percent +
                        record.rb_percent +
                        record.wr_percent +
                        record.te_percent +
                        record.picks_percent
                      "
                      :strokeColor="getPositionColor('Picks')"
                      strokeWidth="25"
                      class="overlay-progress-overall"
                      :show-info="false"
                    />
                    <a-tooltip title="Total Progress Tooltip">
                      <a-progress
                        :percent="
                          record.qb_percent +
                          record.rb_percent +
                          record.wr_percent +
                          record.te_percent
                        "
                        :strokeColor="getPositionColor('TE')"
                        strokeWidth="25"
                        class="overlay-progress-overall"
                        :show-info="false"
                      />
                    </a-tooltip>

                    <a-progress
                      :percent="record.qb_percent + record.rb_percent + record.wr_percent"
                      :strokeColor="getPositionColor('WR')"
                      strokeWidth="25"
                      class="overlay-progress-overall"
                      :show-info="false"
                    />

                    <a-progress
                      :percent="record.qb_percent + record.rb_percent"
                      :strokeColor="getPositionColor('RB')"
                      strokeWidth="25"
                      class="overlay-progress-overall"
                      :show-info="false"
                    />

                    <a-tooltip
                      :title="`QB: ${record.qb_sum.toLocaleString()}
          RB: ${record.rb_sum.toLocaleString()}
          WR: ${record.wr_sum.toLocaleString()}
          TE: ${record.te_sum.toLocaleString()}
          Picks: ${record.picks_sum.toLocaleString()}
          `"
                      ><a-progress
                        :percent="record.qb_percent"
                        :strokeColor="getPositionColor('QB')"
                        strokeWidth="25"
                        class="overlay-progress-overall"
                        :show-info="false"
                      />
                    </a-tooltip>
                  </div>
                </template>
                <template #expandedRowRender="{ record }">
                  Team Composition:
                  <div class="card" bordered>
                    <MeterGroup :value="formatGaugeData(record)" />
                  </div>
                  <div>
                    <a-divider orientation="center"></a-divider>
                    <a-row justify="space-around" gutter="0">
                      <a-col :span="4">
                        <a-card :title="`Quarterbacks ${addOrdinalSuffix(record.qb_rank)}`">
                          <div
                            v-for="player in getPlayers(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'QB'">
                              {{ player.full_name }}
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
                      </a-col>

                      <a-col :span="4">
                        <a-card
                          :title="`Running Backs ${addOrdinalSuffix(record.rb_rank)}`"
                          bordered
                        >
                          <div
                            v-for="player in getPlayers(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'RB'">
                              {{ player.full_name }}
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
                      </a-col>

                      <a-col :span="4">
                        <a-card
                          :title="`Wide Receivers ${addOrdinalSuffix(record.wr_rank)}`"
                          bordered
                        >
                          <div
                            v-for="player in getPlayers(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'WR'">
                              {{ player.full_name }}
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
                      </a-col>
                      <a-col :span="4">
                        <a-card :title="`Tight Ends ${addOrdinalSuffix(record.te_rank)}`">
                          <div
                            v-for="player in getPlayers(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'TE'">
                              {{ player.full_name }}
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
                      </a-col>
                      <a-col :span="4">
                        <a-card :title="`Picks ${addOrdinalSuffix(record.picks_rank)}`">
                          <div
                            v-for="player in getPlayers(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'PICKS'">
                              {{ player.full_name }}
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
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
          </TabPanel>
          <TabPanel header="Starters">
            <h2 style="text-align: left">Starting Rosters</h2>
            <div class="table-section" style="flex: 2">
              <a-table
                :data-source="summaryData"
                :columns="starterColumns"
                :pagination="{ pageSize: 20 }"
                style="width: 100%; max-width: 850px"
                row-key="user_id"
                :expand-column-width="100"
                :scroll="{ x: '850px' }"
                ><template #expandedRowRender="{ record }">
                  <div>
                    <a-divider orientation="center"></a-divider>
                    <a-row justify="space-around" gutter="0">
                      <a-col :xs="12" :sm="12" :md="8" :lg="6" :xl="6">
                        <a-card
                          :title="`Quarterbacks ${addOrdinalSuffix(record.qb_starter_rank)}`"
                          style="margin: 0"
                        >
                          <div
                            v-for="player in getStarters(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'QB'">
                              {{ player.full_name }} &bull;
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
                      </a-col>

                      <a-col :xs="12" :sm="12" :md="8" :lg="6" :xl="6">
                        <a-card
                          :title="`Running Backs ${addOrdinalSuffix(record.rb_starter_rank)}`"
                          bordered
                        >
                          <div
                            v-for="player in getStarters(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'RB'">
                              {{ player.full_name }} &bull;
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
                      </a-col>

                      <a-col :xs="12" :sm="12" :md="8" :lg="6" :xl="6">
                        <a-card
                          :title="`Wide Receivers ${addOrdinalSuffix(record.wr_starter_rank)}`"
                          bordered
                        >
                          <div
                            v-for="player in getStarters(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'WR'">
                              {{ player.full_name }} &bull;
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
                      </a-col>
                      <a-col :xs="12" :sm="12" :md="8" :lg="6" :xl="6">
                        <a-card
                          :title="`Tight Ends ${addOrdinalSuffix(record.te_starter_rank)}`"
                          bordered
                        >
                          <div
                            v-for="player in getStarters(record.user_id)"
                            :key="player.sleeper_id"
                          >
                            <p v-if="player.player_position === 'TE'">
                              {{ player.full_name }} &bull;
                              {{
                                player.player_value === -1
                                  ? 'N/A'
                                  : player.player_value.toLocaleString()
                              }}
                            </p>
                          </div>
                        </a-card>
                      </a-col>
                    </a-row>
                  </div>
                </template>
                <template v-slot:starterValueTooltip="{ record }">
                  <a-tooltip
                    color="blue"
                    :title="`Starters: ${record.starters_sum?.toLocaleString()}`"
                    ><span>{{ record.starters_rank_display }}</span>
                  </a-tooltip>
                </template>
                <template v-slot:qbStarterValueTooltip="{ record }">
                  <a-tooltip color="blue" :title="`QB: ${record.qb_starter_sum?.toLocaleString()}`"
                    ><span>{{ record.qb_starter_rank_display }}</span>
                  </a-tooltip>
                </template>
                <template v-slot:rbStarterValueTooltip="{ record }">
                  <a-tooltip color="blue" :title="`RB: ${record.rb_starter_sum?.toLocaleString()}`"
                    ><span>{{ record.rb_starter_rank_display }}</span>
                  </a-tooltip>
                </template>
                <template v-slot:wrStarterValueTooltip="{ record }">
                  <a-tooltip color="blue" :title="`WR: ${record.wr_starter_sum?.toLocaleString()}`"
                    ><span>{{ record.wr_starter_rank_display }}</span>
                  </a-tooltip>
                </template>
                <template v-slot:teStarterValueTooltip="{ record }">
                  <a-tooltip color="blue" :title="`TE: ${record.te_starter_sum?.toLocaleString()}`"
                    ><span>{{ record.te_starter_rank_display }}</span>
                  </a-tooltip>
                </template>
              </a-table>
            </div>
          </TabPanel>
          <TabPanel header="Projections">
            <a-space>
              <a-select
                ref="select"
                v-model:value="value1"
                style="width: 175px"
                @focus="focus"
                @change="handleProjChange"
              >
                <a-select-option value="espn">ESPN</a-select-option>
                <a-select-option value="nfl">NFL</a-select-option>
                <a-select-option value="cbs">CBS</a-select-option>
                <a-select-option value="fc" disabled>FantasyCalc</a-select-option>
              </a-select>
            </a-space>
            <h2 style="text-align: center">League Projections</h2>
            <a-spin :spinning="isProjectionLoading">
              <div>
                <!-- Check if the data is loading and display a loading indicator or empty state -->
                <a-empty
                  v-if="!projChartData.datasets || projChartData.datasets.length === 0"
                  :image="simpleImage"
                />

                <div v-else>
                  <div class="chart-container">
                    <Chart type="bar" :data="projChartData" :options="projChartOptions" />
                  </div>
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
                        <a-row justify="space-around" gutter="0">
                          <a-col :span="6">
                            <a-card :title="`Quarterbacks ${addOrdinalSuffix(record.qb_rank)}`">
                              <div
                                v-for="player in projPlayers(record.user_id)"
                                :key="player.sleeper_id"
                              >
                                <p v-if="player.player_position === 'QB'">
                                  {{ player.full_name }}
                                  {{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value.toLocaleString()
                                  }}
                                </p>
                              </div>
                            </a-card>
                          </a-col>

                          <a-col :span="6">
                            <a-card
                              :title="`Running Backs ${addOrdinalSuffix(record.rb_rank)}`"
                              bordered
                            >
                              <div
                                v-for="player in projPlayers(record.user_id)"
                                :key="player.sleeper_id"
                              >
                                <p v-if="player.player_position === 'RB'">
                                  {{ player.full_name }}
                                  {{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value.toLocaleString()
                                  }}
                                </p>
                              </div>
                            </a-card>
                          </a-col>

                          <a-col :span="6">
                            <a-card
                              :title="`Wide Receivers ${addOrdinalSuffix(record.wr_rank)}`"
                              bordered
                            >
                              <div
                                v-for="player in projPlayers(record.user_id)"
                                :key="player.sleeper_id"
                              >
                                <p v-if="player.player_position === 'WR'">
                                  {{ player.full_name }}
                                  {{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value.toLocaleString()
                                  }}
                                </p>
                              </div>
                            </a-card>
                          </a-col>
                          <a-col :span="6">
                            <a-card :title="`Tight Ends ${addOrdinalSuffix(record.te_rank)}`">
                              <div
                                v-for="player in projPlayers(record.user_id)"
                                :key="player.sleeper_id"
                              >
                                <p v-if="player.player_position === 'TE'">
                                  {{ player.full_name }}
                                  {{
                                    player.player_value === -1
                                      ? 'N/A'
                                      : player.player_value.toLocaleString()
                                  }}
                                </p>
                              </div>
                            </a-card>
                          </a-col>
                        </a-row>
                      </div>
                    </template>
                  </a-table>
                  {{ projDetailData }}
                </div>
              </div>
            </a-spin>
          </TabPanel>
          <TabPanel header="Players">
            <h2 style="text-align: left">Full League Rosters</h2>
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
                <a-card
                  :title="`${manager.display_name} &bull; ${addOrdinalSuffix(manager.total_rank)} Overall`"
                >
                  <div v-for="(player, index) in getPlayers(manager.user_id)">
                    <div v-if="player.player_position === 'QB'">
                      <a-tag :style="getPositionTag(player.player_position)">{{
                        player.player_position
                      }}</a-tag>
                      {{ index + 1 }}. {{ player.full_name }} &bull;
                      {{
                        player.player_value === -1 ? 'N/A' : player.player_value.toLocaleString()
                      }}
                    </div>
                    <div v-if="player.player_position === 'RB'">
                      <a-tag :style="getPositionTag(player.player_position)">{{
                        player.player_position
                      }}</a-tag>
                      {{ index + 1 }}. {{ player.full_name }} &bull;
                      {{
                        player.player_value === -1 ? 'N/A' : player.player_value.toLocaleString()
                      }}
                    </div>
                    <div v-if="player.player_position === 'WR'">
                      <a-tag :style="getPositionTag(player.player_position)">{{
                        player.player_position
                      }}</a-tag>
                      {{ index + 1 }}. {{ player.full_name }} &bull;
                      {{
                        player.player_value === -1 ? 'N/A' : player.player_value.toLocaleString()
                      }}
                    </div>
                    <div v-if="player.player_position === 'TE'">
                      <a-tag :style="getPositionTag(player.player_position)">{{
                        player.player_position
                      }}</a-tag>
                      {{ index + 1 }}. {{ player.full_name }} &bull;
                      {{
                        player.player_value === -1 ? 'N/A' : player.player_value.toLocaleString()
                      }}
                    </div>
                    <div v-if="player.player_position === 'PICKS'">
                      <a-tag :style="getPositionTag(player.player_position)">{{
                        player.player_position
                      }}</a-tag>
                      {{ index + 1 }}. {{ player.full_name }} &bull;
                      {{
                        player.player_value === -1 ? 'N/A' : player.player_value.toLocaleString()
                      }}
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </TabPanel>
          <TabPanel header="Manager View">
            <h2 style="text-align: left">Team Dashboard</h2>
            <div v-for="manager in summaryData" :key="manager.user_id">
              <div v-if="manager.user_id === leagueInfo.userId">
                <a-row :gutter="{ xs: 8, sm: 16, md: 24 }">
                  <div v-for="position in ['QB', 'RB', 'WR', 'TE', 'PICKS']" :key="position">
                    <a-col :key="position" xs="24" sm="12" md="8" lg="6">
                      <a-card>
                        <template #title>
                          <a-tag :style="getPositionTag(position)" size="large">{{
                            position
                          }}</a-tag>
                        </template>
                        <div
                          v-for="(player, index) in getPlayers(manager.user_id)"
                          :key="player.full_name"
                        >
                          <div v-if="player.player_position === position">
                            {{ index + 1 }}. {{ player.full_name }} &bull;
                            {{
                              player.player_value === -1
                                ? 'N/A'
                                : player.player_value.toLocaleString()
                            }}
                          </div>
                        </div>
                      </a-card>
                    </a-col>
                  </div>
                </a-row>
              </div>
            </div>
            <div class="chart-container">
              <h3>{{ leagueInfo.userName }} &bull; Age and Value Chart</h3>
              <Chart type="bubble" :data="chartData" :options="chartOptions" />
            </div>
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
                          (leagueOwnerData.qb_starter_sum / leagueOwnerData.qb_max_starter_value) *
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
                          (leagueOwnerData.rb_starter_sum / leagueOwnerData.rb_max_starter_value) *
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
                          (leagueOwnerData.wr_starter_sum / leagueOwnerData.wr_max_starter_value) *
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
                          (leagueOwnerData.te_starter_sum / leagueOwnerData.te_max_starter_value) *
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
          </TabPanel>
          <TabPanel header="Waivers">
            <div>
              <h2>Best Available</h2>
              <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                <a-col
                  :xs="24"
                  :sm="12"
                  :md="8"
                  :lg="6"
                  v-for="(players, position) in groupedPlayers"
                  :key="position"
                >
                  <a-card>
                    <template #title>
                      <a-tag :style="getPositionTag(position)" size="large">{{ position }}</a-tag>
                    </template>
                    <p v-for="player in players" :key="player.sleeper_id">
                      {{ player.full_name }} &bull;
                      {{
                        player.player_value === -1 ? 'N/A' : player.player_value?.toLocaleString()
                      }}
                    </p>
                  </a-card>
                </a-col>
              </a-row>
            </div></TabPanel
          >
          <TabPanel header="Trades (Beta)">
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
          ></TabPanel>
        </TabView>
      </a-spin>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// 3rd Party imports
import axios from 'axios'

// Platform Utils
import { message, Spin, Column, Empty, MenuProps } from 'ant-design-vue'
import MeterGroup from 'primevue/metergroup'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Chart from 'primevue/chart'
import 'primeicons/primeicons.css'

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'
import { getCellStyle } from '../utils/colorTable'

// Sourec image imports
import sfLogo from '@/assets/sourceLogos/sf.png'
import ktcLogo from '@/assets/sourceLogos/ktc.png'
import dpLogo from '@/assets/sourceLogos/dp.png'
import fcLogo from '@/assets/sourceLogos/fc.png'

const route = useRoute()

const state = reactive({
  checked1: true
})

const handleButtonClick = (e: Event) => {
  console.log('click left button', e)
}

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

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

// Sample league information
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

const leaguesUrl = `/leagues/${leagueYear}/${userName}/${guid}`

const isLoading = ref(false)
const summaryIsLoading = ref(false)
const detailIsLoading = ref(false)
const isProjectionLoading = ref(false)
const isTradesLoading = ref(false)

const value1 = ref('Choose Projection')
const sources = [
  { key: 'sf', name: 'SuperFlex', logo: sfLogo },
  { key: 'ktc', name: 'KeepTradeCut', logo: ktcLogo },
  { key: 'dp', name: 'DynastyProcess', logo: dpLogo },
  { key: 'fc', name: 'FantasyCalc', logo: fcLogo }
]
const source = ref('SuperFlex')
const selectedSource = ref(sources[0])

const filteredSources = computed(() => {
  if (leagueInfo.rankType !== 'Dynasty') {
    return sources.filter(
      (source) => source.key === 'fc' || source.key === 'ktc' || source.key === 'sf'
    )
  }
  return sources
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

const projChartData = ref({})

const projChartOptions = {
  options: { maintainAspectRatio: false, aspectRatio: 2 },
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true
    }
  }
}

const handleProjChange = async (projectionSource: any) => {
  isProjectionLoading.value = true
  console.log(leagueId)
  console.log(projectionSource)
  console.log(guid)
  try {
    const [summaryResponse, detailResponse] = await Promise.all([
      axios.get('http://20.242.213.253:3100/contender_league_summary', {
        params: {
          league_id: leagueId,
          projection_source: projectionSource,
          guid: guid
        }
      }),
      axios.get('http://20.242.213.253:3100/contender_league_detail', {
        params: {
          league_id: leagueId,
          projection_source: projectionSource,
          guid: guid
        }
      })
    ])

    console.log('API summaryResponse response:', summaryResponse.data)
    console.log('API detail Response response:', detailResponse.data)

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

    const responseData = summaryResponse.data
    const displayName = responseData.map((item: any) => item.display_name)
    const qbSum = responseData.map((item: any) => item.qb_sum)
    const rbSum = responseData.map((item: any) => item.rb_sum)
    const wrSum = responseData.map((item: any) => item.wr_sum)
    const teSum = responseData.map((item: any) => item.te_sum)
    projChartData.value = {
      labels: displayName,
      responsive: true,
      datasets: [
        {
          label: 'QB',
          data: qbSum,
          backgroundColor: 'rgb(39, 125, 161)' // example color
        },
        {
          label: 'RB',
          data: rbSum,
          backgroundColor: 'rgb(144, 190, 109)' // example color
        },
        {
          label: 'WR',
          data: wrSum,
          backgroundColor: 'rgb(67, 170, 139)' // example color
        },
        {
          label: 'TE',
          data: teSum,
          backgroundColor: 'rgb(249, 132, 74)' // example color
        }
      ]
    }
  } catch (error) {
    console.error('Error calling internal API:', error)
  } finally {
    isProjectionLoading.value = false
  }
}

function formatGaugeData(record) {
  // Assuming 'record' has a property 'usedSpace' you want to display
  return [
    {
      label: `QB: ${record.qb_sum.toLocaleString()}`,
      color: 'rgb(39, 125, 161)',
      value: record.qb_percent,
      total: record.qb_value
    },
    {
      label: `RB: ${record.rb_sum.toLocaleString()}`,
      color: 'rgb(144, 190, 109)',
      value: record.rb_percent
    },
    {
      label: `WR: ${record.wr_sum.toLocaleString()}`,
      color: 'rgb(67, 170, 139)',
      value: record.wr_percent
    },
    {
      label: `TE: ${record.te_sum.toLocaleString()}`,
      color: 'rgb(249, 132, 74)',
      value: record.te_percent
    },
    {
      label: `Picks: ${record.picks_sum.toLocaleString()}`,
      color: 'rgba(189, 195, 199, 0.6)',
      value: record.picks_percent
    }
  ]
}

const getLogoPath = (path) => {
  return require('@/assets/sourceLogos/' + path)
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
const columns: Column[] = [
  {
    title: '',
    dataIndex: 'display_name',
    key: 'display_name',
    align: 'left',
    width: 1
  },
  {
    title: 'Stack Rank',
    dataIndex: 'display_name',
    key: 'display_name',
    align: 'left',
    slots: { customRender: 'customProgressBar' },
    width: 220
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
    title: 'QB',
    dataIndex: 'qb_rank',
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
    dataIndex: 'rb_rank',
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
    dataIndex: 'wr_rank',
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
    dataIndex: 'te_rank',
    key: 'te_rank',
    align: 'center',
    slots: { customRender: 'teValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.te_rank)
    }),
    sorter: {
      compare: (a, b) => a.te_rank - b.te_rank
    }
  },
  {
    title: 'Picks',
    dataIndex: 'picks_rank',
    key: 'picks_rank',
    align: 'center',
    slots: { customRender: 'picksValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.picks_rank)
    }),
    sorter: {
      compare: (a, b) => a.picks_rank - b.picks_rank
    }
  },
  {
    title: 'Bench',
    dataIndex: 'bench_rank',
    key: 'bench_rank',
    align: 'center',
    slots: { customRender: 'benchValueTooltip' },
    customCell: (record: any) => ({
      style: getCellStyle(record.bench_rank)
    }),
    sorter: {
      compare: (a, b) => a.bench_rank - b.bench_rank
    }
  }
  // Add more columns as needed
]

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
    fetchSummaryData(leagueId, platform, rankType, guid, rosterType)
    fetchDetailData(leagueId, platform, rankType, guid, rosterType)
    fetchBaData(leagueId, platform, rankType, guid, rosterType)
    fetchTrades(leagueId, platform, rosterType, leagueYear, rankType)
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
  } else if (position === 'Picks') {
    return 'rgb(70, 70, 70, .6)'
  } else {
    return 'rgb(0, 0, 0, .00)'
  }
}

function getPositionTag(position) {
  switch (position) {
    case 'QB':
      return {
        color: 'rgb(39, 125, 161)',
        background: 'rgb(39, 125, 161, .15)',
        'border-color': 'rgb(39, 125, 161)'
      }
    case 'RB':
      return {
        color: 'rgb(144, 190, 109)',
        background: 'rgb(144, 190, 109, .15)',
        'border-color': 'rgb(144, 190, 109)'
      }
    case 'WR':
      return {
        color: 'rgb(67, 170, 139)',
        background: 'rgb(67, 170, 139, .15)',
        'border-color': 'rgb(67, 170, 139)'
      }
    case 'TE':
      return {
        color: 'rgb(249, 132, 74)',
        background: 'rgb(249, 132, 74, .15)',
        'border-color': 'rgb(249, 132, 74)'
      }
    case 'PICKS':
      return {
        color: 'rgb(143, 145, 146)',
        background: 'rgb(143, 145, 146, .15)',
        'border-color': 'rgb(143, 145, 146)'
      }
    default:
      return {}
  }
}

const getStarters = (userId) => {
  const interimData = detailData.value
    .filter((item) => item.user_id === userId)
    .filter((item) => item.fantasy_designation === 'STARTER')
    .filter((item) => item.player_position != 'PICKS')
  return interimData
}

const getPlayers = (userId) => {
  const interimData = detailData.value.filter((item) => item.user_id === userId)
  return interimData
}
const projPlayers = (userId) => {
  const projInterimData = projDetailData.value.filter((item) => item.user_id === userId)
  return projInterimData
}

const insertLeagueDetials = async (values: any) => {
  isLoading.value = true
  detailIsLoading.value = true
  summaryIsLoading.value = true
  console.log('trying insert rosters')
  console.log(leagueId)
  console.log(userId)
  console.log(guid)
  console.log(leagueYear)

  try {
    const response = await axios.post('http://20.242.213.253:3100/roster', {
      league_id: leagueInfo.leagueId,
      user_id: leagueInfo.userId,
      guid: leagueInfo.guid,
      league_year: leagueInfo.leagueYear
    })

    console.log('Rosters loading...')
  } catch (error) {
    console.error('Error loading rosters', error)
    // Optionally, update leagueDetails to indicate an error or show an error message
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
      leagueInfo.leagueNameapiSource,
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
  }
}
async function fetchSummaryData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string
) {
  summaryIsLoading.value = true
  try {
    const response = await axios.get(`http://20.242.213.253:3100/league`, {
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
    const maxTotalValue = Math.max(...rawData.map((item) => item.total_value))
    // summaryData.value = response.data // Update this line based on the structure of your actual data
    summaryData.value = response.data.map((item) => {
      return {
        ...item,
        total_rank_display: addOrdinalSuffix(item.total_rank),
        starters_rank_display: addOrdinalSuffix(item.starters_rank),
        qb_rank_display: addOrdinalSuffix(item.qb_rank),
        rb_rank_display: addOrdinalSuffix(item.rb_rank),
        wr_rank_display: addOrdinalSuffix(item.wr_rank),
        te_rank_display: addOrdinalSuffix(item.te_rank),
        qb_starter_rank_display: addOrdinalSuffix(item.qb_starter_rank),
        rb_starter_rank_display: addOrdinalSuffix(item.rb_starter_rank),
        wr_starter_rank_display: addOrdinalSuffix(item.wr_starter_rank),
        te_starter_rank_display: addOrdinalSuffix(item.te_starter_rank),
        picks_rank_display: addOrdinalSuffix(item.picks_rank),
        bench_rank_display: addOrdinalSuffix(item.bench_rank),
        total_percent: (item.total_value / maxTotalValue) * 100,
        qb_percent: (item.qb_sum / maxTotalValue) * 100,
        rb_percent: (item.rb_sum / maxTotalValue) * 100,
        wr_percent: (item.wr_sum / maxTotalValue) * 100,
        te_percent: (item.te_sum / maxTotalValue) * 100,
        picks_percent: (item.picks_sum / maxTotalValue) * 100
      }
    })
  } catch (error) {
    console.error('There was an error fetching the leagues summary data:', error)
    message.error('Failed to fetch league summary data.')
  } finally {
    summaryIsLoading.value = false
  }
}

async function fetchBaData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string
) {
  // detailIsLoading.value = true
  try {
    const response = await axios.get(`http://20.242.213.253:3100/best_avialable`, {
      params: {
        league_id: leagueId,
        platform: platform,
        rank_type: rankType,
        guid: guid,
        roster_type: rosterType
      }
    })

    bestAvailableData.value = response.data
  } catch (error) {
    console.error('There was an error fetching the best available data:', error)
    message.error('Failed to fetch best available data.')
  } finally {
    // detailIsLoading.value = false
  }
}

async function fetchTrades(
  leagueId: string,
  platform: string,
  rosterType: string,
  leagueYear: string,
  rankType: string
) {
  // detailIsLoading.value = true
  try {
    console.log('Pulling trades')
    const [summaryResponse, detailResponse] = await Promise.all([
      axios.get('http://20.242.213.253:3100/trades_summary', {
        params: {
          league_id: leagueId,
          platform: platform,
          roster_type: rosterType,
          league_year: leagueYear,
          rank_type: rankType
        }
      }),
      axios.get('http://20.242.213.253:3100/trades_detail', {
        params: {
          league_id: leagueId,
          platform: platform,
          roster_type: rosterType,
          league_year: leagueYear,
          rank_type: rankType
        }
      })
    ])

    console.log('Trades API: summaryResponse response:', summaryResponse.data)
    console.log('Trades API: detail Response response:', detailResponse.data)

    const sDetailData = summaryResponse.data
    const tDetailData = detailResponse.data

    tradesSummaryData.value = sDetailData
    tradesDetailData.value = tDetailData
  } catch (error) {
    console.log(error)
    console.log('There was an error...')
  } finally {
    console.log('finally complete')
  }
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

const leagueOwnerDataByPosition = (position) =>
  computed(() => {
    return detailData.value
      .filter((item) => item.user_id === leagueInfo.userId && item.player_position === position)
      .map((player) => ({
        x: player.age, // Or another relevant metric
        y: player.player_value,
        r: 7, // Or calculate based on a metric
        label: player.full_name // Adding full_name as label for tooltips
      }))
  })

const chartData = computed(() => {
  const positions = ['QB', 'RB', 'WR', 'TE'] // Extend this array based on your data
  const colors = {
    QB: 'rgb(39, 125, 161)',
    RB: 'rgb(144, 190, 109)',
    WR: 'rgb(67, 170, 139)',
    TE: 'rgb(249, 132, 74)'
  }

  return {
    datasets: positions.map((position) => ({
      label: position,
      data: leagueOwnerDataByPosition(position).value,
      backgroundColor: colors[position]
    }))
  }
})
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false, // Set to false to fully fit the container, true to maintain aspect ratio
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 12 // Smaller font size for better readability on small screens
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
            size: 10 // Smaller font size for x-axis ticks
          }
        }
      },
      y: {
        min: 0,
        max: 9999,
        ticks: {
          font: {
            size: 10 // Smaller font size for y-axis ticks
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
  // empty detail data
  detailData.value = []
  try {
    const response = await axios.get(`http://20.242.213.253:3100/league_detail`, {
      params: {
        league_id: leagueId,
        platform: platform,
        rank_type: rankType,
        guid: guid,
        roster_type: rosterType
      }
    })

    detailData.value = response.data
  } catch (error) {
    console.error('There was an error fetching the leagues detail data:', error)
    message.error('Failed to fetch league detail data.')
  } finally {
    detailIsLoading.value = false
  }
}
</script>

<style scoped>
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
/* Target the table rows in the table body */
.ant-table-tbody > tr {
  border-bottom: 1px solid white; /* Adds a white line between rows */
}

/* Target the cells in the table body */
.ant-table-tbody > tr > td {
  color: white; /* Makes the font color white */
}

/* If you also want to style the header */
.ant-table-thead > tr > th {
  color: white; /* Makes the font color white in the header */
  border-bottom: 2px solid white; /* Adds a white line below the header */
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
  bottom: 200; /* Position it at the bottom of the container */
  width: 20px; /* or the thickness you want for the line */
  background-color: red; /* or any color for the median line */
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
  width: 15px; /* Circle size */
  height: 15px; /* Circle size */
  border-radius: 25%; /* Make it round */
  margin-right: 5px; /* Space between circle and text */
}

.legend-text {
  font-size: 14px; /* Adjust text size */
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
/* This is the base style, for mobile screens */
.responsive-padding {
  padding: 0 16px; /* Small padding for small screens */
}

/* Media query for screens wider than 768px */
@media (min-width: 768px) {
  .responsive-padding {
    padding: 0 100px; /* Larger padding for larger screens */
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
  align-items: center; /* Aligns the children vertically in the center */
  justify-content: left; /* Centers the children horizontally */
  flex-wrap: wrap; /* Allows children to wrap to next line as needed */
  text-align: center; /* Ensures text is centered if it wraps */
}
.rank-logos {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
}
.avatar-traded-asset {
  width: 38px;
  height: 32px;
  flex: 0 0 38px;
  /* float: left; */
  /* background: center center / cover rgb(239, 239, 239); */
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid rgb(39, 125, 161);
}

.load-league-button {
  max-width: 150px; /* Set your desired maximum width */
}
</style>
