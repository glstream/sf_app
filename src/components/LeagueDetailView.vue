<template>
  <a-layout class="layout">
    <AppHeader />
    <a-layout-content class="responsive-padding" :style="{ marginTop: '64px' }">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item
          ><a href="/username"><home-outlined /></a
        ></a-breadcrumb-item>
        <a-breadcrumb-item><a :href="leaguesUrl">Leagues</a></a-breadcrumb-item>
        <a-breadcrumb-item>League Details</a-breadcrumb-item>
      </a-breadcrumb>
      <div style="">
        <div class="">
          <div class="">
            <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
              <a-col :span="24">
                <h2 class="league-title">
                  <img
                    class="league-logo"
                    :src="`https://sleepercdn.com/avatars/thumbs/${leagueInfo.avatar}`"
                    alt="League Logo"
                  />
                  {{ leagueInfo.leagueName }}
                </h2>
              </a-col>
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
                  <a-button @click="insertLeagueDetials(leagueInfo.leagueId)" type="primary">
                    <ReloadOutlined /> League
                  </a-button>
                </div>
              </a-col>
            </a-row>
            <a-row>
              <a-col class="gutter-row" :span="12">
                <div class="gutter-box-button">
                  <a-button type="default" @click="getLeagueSummary()">
                    <FileSearchOutlined />Summary</a-button
                  >
                </div>
              </a-col>
              <a-col class="gutter-row" :span="12">
                <div class="gutter-box-refresh">
                  <a-flex :gap="10">
                    <a-dropdown-button :loading="summaryIsLoading">
                      <img
                        style="padding-right: 5px"
                        class="rank-logos"
                        :src="selectedSource.logo"
                      />
                      {{ selectedSource.name }}
                      <template #overlay>
                        <a-menu @click="handleMenuClick">
                          <a-menu-item v-for="source in filteredSources" :key="source.key">
                            <UserOutlined />
                            <img
                              style="padding-right: 5px"
                              class="rank-logos"
                              :src="source.logo"
                            />{{ source.name }}
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown-button>
                  </a-flex>
                </div>
              </a-col>
              <a-col class="gutter-row" :span="12">
                <div class="gutter-box-dropdown"></div>
              </a-col>
            </a-row>
          </div>
        </div>

        <a-spin tip="Loading..." :spinning="summaryIsLoading">
          <TabView :scrollable="true">
            <TabPanel header="Overall">
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col :span="24">
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
                </a-col>
              </a-row>
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
                  <span class="legend-color" style="background-color: rgba(70, 70, 70, 0.7)"></span>
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
                      <a-row justify="space-between" gutter="[8,8]">
                        <a-col :span="4">
                          <a-card
                            :title="`Quarterbacks ${addOrdinalSuffix(record.qb_rank)}`"
                            :head-style="{
                              background: getHeaderColor('QB'),
                              color: getPositionColor('QB')
                            }"
                          >
                            <div
                              v-for="player in getPlayers(record.user_id)"
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

                        <a-col :span="4">
                          <a-card
                            :title="`Running Backs ${addOrdinalSuffix(record.rb_rank)}`"
                            :head-style="{
                              background: getHeaderColor('RB'),
                              color: getPositionColor('RB')
                            }"
                            bordered
                          >
                            <div
                              v-for="player in getPlayers(record.user_id)"
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

                        <a-col :span="4">
                          <a-card
                            :title="`Wide Receivers ${addOrdinalSuffix(record.wr_rank)}`"
                            :head-style="{
                              background: getHeaderColor('WR'),
                              color: getPositionColor('WR')
                            }"
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
                          <a-card
                            :title="`Tight Ends ${addOrdinalSuffix(record.te_rank)}`"
                            :head-style="{
                              background: getHeaderColor('TE'),
                              color: getPositionColor('TE')
                            }"
                          >
                            <div
                              v-for="player in getPlayers(record.user_id)"
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
                        <a-col :span="4">
                          <a-card
                            :title="`Picks ${addOrdinalSuffix(record.picks_rank)}`"
                            :head-style="{
                              background: getHeaderColor('PICKS'),
                              color: getPositionColor('PICKS')
                            }"
                          >
                            <div
                              v-for="player in getPlayers(record.user_id)"
                              :key="player.sleeper_id"
                            >
                              <p v-if="player.player_position === 'PICKS'">
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
                        <a-col :xs="6" :sm="12" :md="8" :lg="6" :xl="6">
                          <a-card
                            :title="`Quarterbacks ${addOrdinalSuffix(record.qb_starter_rank)}`"
                            style="margin: 0"
                            :head-style="{
                              background: getHeaderColor('QB'),
                              color: getPositionColor('QB')
                            }"
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

                        <a-col :xs="6" :sm="12" :md="8" :lg="6" :xl="6">
                          <a-card
                            :title="`Running Backs ${addOrdinalSuffix(record.rb_starter_rank)}`"
                            :head-style="{
                              background: getHeaderColor('RB'),
                              color: getPositionColor('RB')
                            }"
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

                        <a-col :xs="6" :sm="12" :md="8" :lg="6" :xl="6">
                          <a-card
                            :title="`Wide Receivers ${addOrdinalSuffix(record.wr_starter_rank)}`"
                            :head-style="{
                              background: getHeaderColor('WR'),
                              color: getPositionColor('WR')
                            }"
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
                        <a-col :xs="6" :sm="12" :md="8" :lg="6" :xl="6">
                          <a-card
                            :title="`Tight Ends ${addOrdinalSuffix(record.te_starter_rank)}`"
                            :head-style="{
                              background: getHeaderColor('TE'),
                              color: getPositionColor('TE')
                            }"
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
                    <a-tooltip
                      color="blue"
                      :title="`QB: ${record.qb_starter_sum?.toLocaleString()}`"
                      ><span>{{ record.qb_starter_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:rbStarterValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :title="`RB: ${record.rb_starter_sum?.toLocaleString()}`"
                      ><span>{{ record.rb_starter_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:wrStarterValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :title="`WR: ${record.wr_starter_sum?.toLocaleString()}`"
                      ><span>{{ record.wr_starter_rank_display }}</span>
                    </a-tooltip>
                  </template>
                  <template v-slot:teStarterValueTooltip="{ record }">
                    <a-tooltip
                      color="blue"
                      :title="`TE: ${record.te_starter_sum?.toLocaleString()}`"
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
            <TabPanel header="Rosters">
              <h2 style="text-align: left">Players by Team</h2>
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
                    <ul style="width: 100%; padding: 0">
                      <div v-for="(player, index) in getPlayers(manager.user_id)">
                        <div>
                          <li
                            :style="getPositionTag(player.player_position)"
                            style="list-style-type: none; color: black"
                          >
                            <a-tag :style="getPositionTag(player.player_position)">{{
                              player.player_position
                            }}</a-tag>

                            {{ index + 1 }}. {{ player.full_name }} &bull;
                            {{
                              player.player_value === -1
                                ? 'N/A'
                                : player.player_value.toLocaleString()
                            }}
                          </li>
                        </div>
                      </div>
                    </ul>
                  </a-card>
                </a-col>
              </a-row>
            </TabPanel>
            <TabPanel header="League View">
              <h2 style="text-align: left">League Dashboard</h2>
              <div style="display: flex; justify-content: left">
                <a-avatar-group
                  maxCount="12"
                  maxPopoverPlacement="bottom"
                  maxPopoverTrigger="hover"
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
                          @click="handleUserClick(user)"
                          class="avatar"
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
                          @click="handleUserClick(user)"
                          class="avatar"
                        />
                      </a-tooltip>
                    </div>
                  </div> </a-avatar-group
                ><span style="font-size: small"> (click to highlight)</span>
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
                  <a-card
                    :title="`Players ${chunkIndex * 50 + 1} - ${Math.min((chunkIndex + 1) * 50, detailData.length)}`"
                    :bordered="false"
                  >
                    <ul style="padding: 0">
                      <li
                        v-for="(player, index) in chunk"
                        :key="player.sleeper_id"
                        :style="getPositionTag(player.player_position, 0.35)"
                        style="color: black"
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
                  </a-card>
                </a-col>
              </a-row>

              {{ detailData }}
            </TabPanel>
            <TabPanel header="Manager View">
              <h2 style="text-align: left">Team Dashboard</h2>
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
            </TabPanel>
            <TabPanel header="Waivers">
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
                    <a-card
                      :head-style="{
                        background: getHeaderColor(position),
                        color: getPositionColor(position)
                      }"
                    >
                      <template #title>
                        <span style="font-size: 18px; font-weight: bolder">{{ position }}</span>
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
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

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

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'
import { getCellStyle } from '../utils/colorTable'

// Sourec image imports
import fnLogo from '@/assets/sourceLogos/fn.png'
import ktcLogo from '@/assets/sourceLogos/ktc.png'
import dpLogo from '@/assets/sourceLogos/dp.png'
import fcLogo from '@/assets/sourceLogos/fc.png'

const route = useRoute()
const router = useRouter()

const state = reactive({
  checked1: true
})

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

const leaguesUrl = `/leagues/${leagueYear}/${userName}/${guid}`

const isLoading = ref(false)
const summaryIsLoading = ref(false)
const detailIsLoading = ref(false)
const isProjectionLoading = ref(false)
const isTradesLoading = ref(false)
const clickedManager = ref('')

const value1 = ref('Choose Projection')
const sources = [
  { key: 'sf', name: 'FantasyNavigator', logo: fnLogo },
  { key: 'ktc', name: 'KeepTradeCut', logo: ktcLogo },
  { key: 'dp', name: 'DynastyProcess', logo: dpLogo },
  { key: 'fc', name: 'FantasyCalc', logo: fcLogo }
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

const handleMenuClick: MenuProps['onClick'] = (e) => {
  console.log('event', e)
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

// Compute chunks of 50 players
const playerChunks = computed(() => {
  const size = 50
  return detailData.value.reduce((acc, val, i) => {
    let idx = Math.floor(i / size)
    let page = acc[idx] || (acc[idx] = [])
    page.push(val)
    return acc
  }, [])
})

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
    const userSummary = summaryData.value.find((item) => item.user_id === leagueInfo.userId)
    summaryIsLoading.value = false

    const response = await axios.post(`${apiUrl}/ranks_summary`, {
      user_id: leagueInfo.userId,
      display_name: leagueInfo.userName,
      league_id: leagueInfo.leagueId,
      rank_source: platform,
      power_rank: userSummary.total_rank,
      starters_rank: userSummary.starters_rank,
      bench_rank: userSummary.bench_rank,
      picks_rank: userSummary.picks_rank
    })
  }
}

async function fetchBaData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string
) {
  try {
    const response = await axios.get(`${apiUrl}/best_avialable`, {
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
    console.log('Best available data fetched')
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
        x: player.age,
        y: player.player_value,
        r: 7,
        label: player.full_name
      }))
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

const chartData = computed(() => {
  const positions = ['QB', 'RB', 'WR', 'TE']
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
  } catch (error) {
    console.error('There was an error fetching the leagues detail data:', error)
    message.error('Failed to fetch league detail data.')
  } finally {
    detailIsLoading.value = false
  }
}
function handleUserClick(user) {
  clickedManager.value = clickedManager.value === user.display_name ? '' : user.display_name
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

@media (min-width: 768px) {
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
  opacity: 0.5;
}
.avatar {
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.2);
}
li {
  list-style-type: none;
  color: black;
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
</style>
