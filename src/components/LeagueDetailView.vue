<template>
  <a-layout class="layout">
    <AppHeader />
    <theme-toggle-button />

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

            <!-- New Data Controls Card -->
            <a-card class="data-controls-card" :bordered="false">
              <a-row :gutter="[16, 16]" align="middle">
                <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
                  <div class="control-group">
                    <span class="control-label">Data View:</span>
                    <a-switch
                      v-model:checked="showProjections"
                      checked-children="Projections"
                      un-checked-children="Overall"
                      @change="handleViewToggle"
                    />
                  </div>
                </a-col>
                <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
                  <div class="control-group">
                    <span class="control-label">Player Filter:</span>
                    <a-radio-group v-model:value="overallFilter" button-style="solid" size="small">
                      <a-radio-button value="all">All Players</a-radio-button>
                      <a-radio-button value="STARTER">Starters</a-radio-button>
                    </a-radio-group>
                  </div>
                </a-col>
                <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
                  <div class="control-group">
                    <span class="control-label">Projection Source:</span>
                    <a-select
                      ref="select"
                      v-model:value="value1"
                      @change="handleProjChange"
                      size="small"
                      style="width: 100px"
                    >
                      <a-select-option value="espn">ESPN</a-select-option>
                      <a-select-option value="cbs">CBS</a-select-option>
                      <a-select-option value="nfl">NFL</a-select-option>
                    </a-select>
                  </div>
                </a-col>
                <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
                  <div class="control-group">
                    <span class="control-label">Rankings Source:</span>
                    <a-dropdown-button :loading="summaryIsLoading" size="small">
                      <img
                        style="padding-right: 5px"
                        class="rank-logos"
                        :src="selectedSource.logo"
                      />
                      {{ selectedSource.name }}
                      <template #overlay>
                        <a-menu @click="handleMenuClick">
                          <a-menu-item v-for="source in filteredSources" :key="source.key">
                            <img
                              style="padding-right: 5px"
                              class="rank-logos"
                              :src="source.logo"
                            />{{ source.name }}
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown-button>
                  </div>
                </a-col>
              </a-row>
            </a-card>
            <!-- End New Data Controls Card -->
          </div>
        </div>

        <a-spin tip="Loading..." :spinning="summaryIsLoading">
          <div class="tab-header-container">
            <a-tabs v-model:activeKey="activeKey">
              <a-tab-pane key="1" tab="Power Rankings">
                <h2 class="tab-sub-header">Power Ranks</h2>

                <!-- Redesigned League Managers section -->
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col :span="24">
                    <a-card :bordered="false" class="managers-card">
                      <template #title>
                        <div class="card-header">
                          <span class="chart-title">League Managers</span>
                        </div>
                      </template>
                      <div class="managers-grid">
                        <div
                          v-for="user in sortedSummaryData"
                          :key="user.user_id"
                          class="manager-item"
                          :class="{ 'current-user': user.user_id === leagueInfo.userId }"
                          @click="handleUserClick(user)"
                        >
                          <div class="manager-avatar">
                            <a-avatar
                              :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                              :size="45"
                            />
                            <span class="manager-rank">{{ getRank(user) }}</span>
                          </div>
                          <div class="manager-details">
                            <div class="manager-name">{{ user.display_name }}</div>
                            <div class="manager-stats">
                              <span
                                >{{ showProjections ? 'Proj' : 'Value' }}:
                                {{
                                  (showProjections
                                    ? projSummaryData.find((p) => p.user_id === user.user_id)
                                        ?.total_value || 0
                                    : user.total_value
                                  ).toLocaleString()
                                }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </a-card>
                  </a-col>
                </a-row>

                <a-row gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                  <a-col :xs="24" :sm="24" :md="12" :lg="11" :xl="11">
                    <a-card :bordered="false" class="modern-card">
                      <template #title>
                        <div class="card-header">
                          <span class="chart-title">{{
                            showProjections ? 'Projections' : 'Ranks'
                          }}</span>
                        </div>
                      </template>
                      <div class="viz-container">
                        <BarChart v-if="!showProjections" :chartData="bchartData" />
                        <ProjectionBarChart v-else :chartData="projectionBarChartData" />
                      </div>
                    </a-card>
                  </a-col>
                  <a-col :xs="0" :sm="0" :md="2" :lg="2" :xl="2"></a-col>
                  <a-col :xs="24" :sm="24" :md="12" :lg="11" :xl="11">
                    <a-card :bordered="false" class="modern-card">
                      <template #title>
                        <div class="card-header">
                          <span class="chart-title">{{
                            showProjections ? 'Roster Composition' : 'Team Tiers'
                          }}</span>
                        </div>
                      </template>
                      <div class="viz-container">
                        <OverallScatterPlot
                          v-if="!showProjections"
                          :scatterPlotData="OverallScatterPlotData"
                        />
                        <ProjectionPercentColumn
                          v-else
                          :projectionPercentColumnData="projectionPercentColumnData"
                        />
                      </div>
                    </a-card>
                  </a-col>
                </a-row>

                <h2 style="text-align: center; margin-top: 30px">
                  {{ showProjections ? 'Projections' : 'Rankings' }} Heat Map
                </h2>
                <!-- Desktop Heatmap Table -->
                <div class="heatmap-desktop-view">
                  <div class="table-section" style="flex: 2">
                    <a-table
                      :columns="showProjections ? projColumns : columns"
                      :dataSource="showProjections ? projSummaryData : summaryData"
                      :pagination="false"
                      row-key="user_id"
                      :expand-column-width="100"
                      style="width: 100%; max-width: 1150px"
                      :scroll="{ x: '1150px' }"
                      :rowClassName="
                        (record) => (record.user_id === leagueInfo.userId ? 'highlighted-row' : '')
                      "
                    >
                      <!-- Customized expandable row -->
                      <template #expandedRowRender="{ record }">
                        <div class="expanded-row-content">
                          <!-- Position Summary Section -->
                          <div class="position-summary">
                            <div
                              v-for="position in [
                                'QB',
                                'RB',
                                'WR',
                                'TE',
                                overallFilter === 'all' && !showProjections ? 'PICKS' : null
                              ].filter(Boolean)"
                              :key="position"
                              class="position-summary-item"
                              :class="`position-${position.toLowerCase()}`"
                            >
                              <div class="position-header">
                                <span class="position-name">{{ position }}</span>
                                <a-tag
                                  :style="
                                    getCellStyle(
                                      overallFilter === 'all'
                                        ? record[`${position.toLowerCase()}_rank`]
                                        : record[`${position.toLowerCase()}_starter_rank`]
                                    )
                                  "
                                  class="position-rank"
                                >
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all'
                                        ? record[`${position.toLowerCase()}_rank`]
                                        : record[`${position.toLowerCase()}_starter_rank`]
                                    )
                                  }}
                                </a-tag>
                              </div>
                              <div class="position-stats">
                                <span class="age-label">Avg Age:</span>
                                <span class="age-value">{{
                                  position === 'PICKS'
                                    ? '--'
                                    : overallFilter === 'all'
                                      ? record[`${position.toLowerCase()}_average_age`]
                                      : record[`${position.toLowerCase()}_starter_average_age`]
                                }}</span>
                                <span class="value-label">Total:</span>
                                <span class="value-amount">{{
                                  (overallFilter === 'all'
                                    ? record[`${position.toLowerCase()}_sum`]
                                    : record[`${position.toLowerCase()}_starter_sum`] || 0
                                  ).toLocaleString()
                                }}</span>
                              </div>
                            </div>
                          </div>

                          <!-- Position Players Grid -->
                          <div class="players-grid">
                            <div
                              v-for="position in [
                                'QB',
                                'RB',
                                'WR',
                                'TE',
                                overallFilter === 'all' && !showProjections ? 'PICKS' : null
                              ].filter(Boolean)"
                              :key="`players-${position}`"
                              class="position-players-column"
                              :data-position="position"
                            >
                              <div class="players-list">
                                <div
                                  v-for="player in (showProjections
                                    ? getPlayersProj(record.user_id)
                                    : getPlayers(record.user_id)
                                  ).filter((p) => p.player_position === position)"
                                  :key="player.sleeper_id"
                                  class="player-card"
                                  :style="getPositionTagList(player.player_position, 0.25)"
                                  :class="{
                                    // Only apply indicators for non-PICKS
                                    'high-value-asset':
                                      player.player_position !== 'PICKS' &&
                                      player.player_value >=
                                        (showProjections
                                          ? projectionValueThresholds[player.player_position] ||
                                            Infinity
                                          : overallValueThresholds[player.player_position] ||
                                            Infinity),
                                    'low-value-asset':
                                      player.player_position !== 'PICKS' &&
                                      player.player_value > 0 &&
                                      player.player_value <=
                                        (showProjections
                                          ? projectionLowValueThresholds[player.player_position] ||
                                            -Infinity
                                          : overallLowValueThresholds[player.player_position] ||
                                            -Infinity),
                                    'mid-value-asset':
                                      player.player_position !== 'PICKS' &&
                                      player.player_value >
                                        (showProjections
                                          ? projectionLowValueThresholds[player.player_position] ||
                                            -Infinity
                                          : overallLowValueThresholds[player.player_position] ||
                                            -Infinity) &&
                                      player.player_value <
                                        (showProjections
                                          ? projectionValueThresholds[player.player_position] ||
                                            Infinity
                                          : overallValueThresholds[player.player_position] ||
                                            Infinity)
                                  }"
                                  @click="
                                    player.player_position !== 'PICKS'
                                      ? showPlayerModal(player)
                                      : null
                                  "
                                >
                                  <div class="player-info">
                                    <div class="player-name-team">
                                      <span class="player-name">{{ player?.full_name }}</span>
                                      <span
                                        v-if="player.player_position !== 'PICKS'"
                                        class="player-team"
                                        >{{ player?.team }}</span
                                      >
                                    </div>
                                    <div class="player-meta">
                                      <span
                                        v-if="player.player_position !== 'PICKS'"
                                        class="player-age"
                                        >{{ player?.age }}y</span
                                      >
                                      <span class="player-value">{{
                                        player.player_value === -1
                                          ? 'N/A'
                                          : player.player_value?.toLocaleString()
                                      }}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </a-table>
                  </div>
                </div>

                <!-- Mobile Heatmap List -->
                <div class="heatmap-mobile-view">
                  <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                    <a-col class="gutter-row" :span="8"></a-col>
                    <a-col class="gutter-row" style="font-weight: bold" :span="4">Overall</a-col>
                    <a-col class="gutter-row" style="font-weight: bold" :span="4">Starters</a-col>
                    <a-col class="gutter-row" style="font-weight: bold" :span="4">Bench</a-col>
                    <a-col class="gutter-row" style="font-weight: bold" :span="4">Picks</a-col>
                  </a-row>
                  <div
                    v-for="user in sortedSummaryData"
                    :key="user.user_id"
                    class="manager-card-mobile"
                    :class="{ 'highlighted-row': user.user_id === leagueInfo.userId }"
                    @click="toggleMobileManagerExpand(user.user_id)"
                  >
                    <!-- Manager Info: Avatar and Name -->
                    <div
                      class="manager-info-line-mobile"
                      style="display: flex; align-items: center; margin-bottom: 8px"
                    >
                      <a-avatar
                        :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                        :size="24"
                        style="margin-right: 8px"
                      />
                      <span class="manager-name-mobile" style="font-weight: bold">{{
                        user.display_name
                      }}</span>
                    </div>

                    <!-- Stats Row -->
                    <a-row :gutter="{ xs: 2, sm: 8 }" class="manager-stats-grid-mobile">
                      <a-col class="gutter-row" :span="8">
                        <a-tag style="font-size: 1.1em">
                          {{
                            (
                              (showProjections
                                ? overallFilter === 'all'
                                  ? user.total_value
                                  : user.starters_sum
                                : overallFilter === 'all'
                                  ? user.total_value
                                  : user.starters_sum) || 0
                            ).toLocaleString()
                          }}

                          {{ showProjections ? ' pts' : '' }}</a-tag
                        >
                      </a-col>
                      <a-col class="gutter-row" :span="4">
                        <div class="gutter-box-stats">
                          <a-tag
                            :style="
                              getCellStyle(
                                Number(
                                  overallFilter === 'all' ? user.total_rank : user.starters_rank
                                )
                              )
                            "
                          >
                            {{
                              addOrdinalSuffix(
                                overallFilter === 'all' ? user.total_rank : user.starters_rank
                              )
                            }}
                          </a-tag>
                        </div></a-col
                      >
                      <a-col class="gutter-row" :span="4">
                        <div class="gutter-box-stats">
                          <a-tag :style="getCellStyle(Number(user.starters_rank))">
                            {{ addOrdinalSuffix(user.starters_rank) }}
                          </a-tag>
                        </div></a-col
                      >
                      <a-col class="gutter-row" :span="4">
                        <div class="gutter-box-stats">
                          <a-tag
                            v-if="overallFilter === 'all'"
                            :style="getCellStyle(Number(user.bench_rank))"
                          >
                            {{ addOrdinalSuffix(user.bench_rank) }}
                          </a-tag>
                          <a-tag v-else>--</a-tag>
                        </div></a-col
                      >
                      <a-col class="gutter-row" :span="4">
                        <div class="gutter-box-stats">
                          <a-tag
                            v-if="overallFilter === 'all' && !showProjections"
                            :style="getCellStyle(Number(user.picks_rank))"
                          >
                            {{ addOrdinalSuffix(user.picks_rank) }}
                          </a-tag>
                          <a-tag v-else>--</a-tag>
                        </div></a-col
                      ></a-row
                    >
                    <div
                      v-if="expandedMobileManagers[user.user_id]"
                      class="manager-card-mobile-details-reused"
                    >
                      <!-- Reusing desktop expanded row content, 'record' is replaced with 'user' -->
                      <div class="expanded-row-content">
                        <!-- Position Summary Section -->
                        <div class="position-summary">
                          <div
                            v-for="position in (showProjections
                              ? ['QB', 'RB', 'WR', 'TE']
                              : ['QB', 'RB', 'WR', 'TE', 'PICKS']
                            ).filter(Boolean)"
                            :key="position"
                            class="position-summary-item"
                            :class="{
                              'position-qb': position === 'QB',
                              'position-rb': position === 'RB',
                              'position-wr': position === 'WR',
                              'position-te': position === 'TE',
                              'position-picks': position === 'PICKS',
                              'active-position-summary':
                                expandedMobileManagerPosition[user.user_id] === position
                            }"
                            @click.stop="toggleMobileManagerPositionExpand(user.user_id, position)"
                          >
                            <div class="position-header">
                              <span class="position-name">{{ positionTitles[position] }}</span>
                              <a-tag
                                class="position-rank"
                                :style="
                                  getCellStyle(
                                    showProjections
                                      ? overallFilter === 'all'
                                        ? Number(user[`${position.toLowerCase()}_rank`])
                                        : Number(user[`${position.toLowerCase()}_starter_rank`])
                                      : overallFilter === 'all'
                                        ? Number(user[`${position.toLowerCase()}_rank`])
                                        : Number(user[`${position.toLowerCase()}_starter_rank`])
                                  )
                                "
                                v-if="
                                  !(position === 'PICKS' && overallFilter !== 'all') &&
                                  user[`${position.toLowerCase()}_rank`] !== undefined
                                "
                              >
                                {{
                                  addOrdinalSuffix(
                                    showProjections
                                      ? overallFilter === 'all'
                                        ? user[`${position.toLowerCase()}_rank`]
                                        : user[`${position.toLowerCase()}_starter_rank`]
                                      : overallFilter === 'all'
                                        ? user[`${position.toLowerCase()}_rank`]
                                        : user[`${position.toLowerCase()}_starter_rank`]
                                  )
                                }}
                              </a-tag>
                              <a-tag v-else-if="position === 'PICKS' && overallFilter !== 'all'">
                                --
                              </a-tag>
                            </div>
                            <div class="position-stats">
                              <template
                                v-if="
                                  !(position === 'PICKS' && overallFilter !== 'all') &&
                                  user[`${position.toLowerCase()}_sum`] !== undefined
                                "
                              >
                                <span class="value-label"
                                  >{{ showProjections ? 'Projections' : 'Value' }}:</span
                                >
                                <span class="value-amount">{{
                                  (showProjections
                                    ? overallFilter === 'all'
                                      ? user[`${position.toLowerCase()}_sum`]
                                      : user[`${position.toLowerCase()}_starter_sum`]
                                    : overallFilter === 'all'
                                      ? user[`${position.toLowerCase()}_sum`]
                                      : user[`${position.toLowerCase()}_starter_sum`] || 0
                                  ).toLocaleString()
                                }}</span>
                                <template v-if="position !== 'PICKS'">
                                  <span class="age-label">Avg Age:</span>
                                  <span class="age-value"
                                    >{{
                                      (showProjections
                                        ? overallFilter === 'all'
                                          ? user[`${position.toLowerCase()}_average_age`]
                                          : user[`${position.toLowerCase()}_starter_average_age`]
                                        : overallFilter === 'all'
                                          ? user[`${position.toLowerCase()}_average_age`]
                                          : user[`${position.toLowerCase()}_starter_average_age`] ||
                                            0
                                      ).toFixed(0)
                                    }}
                                    yrs</span
                                  >
                                </template>
                              </template>
                              <template v-else>
                                <span class="value-label">Value:</span>
                                <span class="value-amount">--</span>
                                <template v-if="position !== 'PICKS'">
                                  <span class="age-label">Avg Age:</span>
                                  <span class="age-value">-- yrs</span>
                                </template>
                              </template>
                            </div>
                            <!-- Player list for this specific position, shown if this position is expanded -->
                            <div
                              v-if="expandedMobileManagerPosition[user.user_id] === position"
                              class="nested-players-container"
                            >
                              <div class="players-list">
                                <div
                                  v-for="player in getPlayersForMobilePosition(
                                    user.user_id,
                                    position
                                  )"
                                  :key="player.sleeper_id"
                                  class="player-card"
                                  :class="{
                                    'high-value-asset':
                                      player.player_value >
                                      (showProjections
                                        ? projectionValueThresholds[player.player_position]
                                        : overallValueThresholds[player.player_position]),
                                    'low-value-asset':
                                      player.player_value > 0 &&
                                      player.player_value <
                                        (showProjections
                                          ? projectionLowValueThresholds[player.player_position]
                                          : overallLowValueThresholds[player.player_position]),
                                    'mid-value-asset':
                                      player.player_value > 0 &&
                                      player.player_value >=
                                        (showProjections
                                          ? projectionLowValueThresholds[player.player_position]
                                          : overallLowValueThresholds[player.player_position]) &&
                                      player.player_value <=
                                        (showProjections
                                          ? projectionValueThresholds[player.player_position]
                                          : overallValueThresholds[player.player_position])
                                  }"
                                  @click.stop="
                                    player.player_position !== 'PICKS'
                                      ? showPlayerModal(player)
                                      : null
                                  "
                                >
                                  <div class="player-info">
                                    <div class="player-name-team">
                                      <span class="player-name">{{ player.full_name }}</span>
                                      <span class="player-team" v-if="player.team">{{
                                        player.team
                                      }}</span>
                                    </div>
                                    <div class="player-meta">
                                      <span class="player-value">{{
                                        player.player_value === -1
                                          ? 'N/A'
                                          : player.player_value?.toLocaleString()
                                      }}</span>
                                      <span
                                        class="player-age"
                                        v-if="player.age && player.player_position !== 'PICKS'"
                                        >{{ player.age }} yrs</span
                                      >
                                    </div>
                                  </div>
                                </div>
                                <div
                                  v-if="
                                    getPlayersForMobilePosition(user.user_id, position).length === 0
                                  "
                                  class="no-players-notice"
                                >
                                  No assets in this category.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>

              <!-- Renamed tab from ROSTERS to TEAM COMPOSITION -->
              <a-tab-pane key="2" tab="Team Composition">
                <h2 class="tab-sub-header">Team Roster Breakdown</h2>
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col :span="24">
                    <a-card :bordered="false" class="managers-card">
                      <template #title>
                        <div class="card-header">
                          <span class="chart-title">League Managers (click to select)</span>
                        </div>
                      </template>
                      <div class="managers-grid">
                        <div
                          v-for="user in sortedSummaryData"
                          :key="user.user_id"
                          class="manager-item"
                          :class="{
                            'current-user': user.user_id === leagueInfo.userId,
                            'selected-manager':
                              selectedUser && selectedUser.user_id === user.user_id
                          }"
                          @click="handleUserClick(user)"
                        >
                          <div class="manager-avatar">
                            <a-avatar
                              :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                              :size="45"
                            />
                            <span class="manager-rank">{{ getRank(user) }}</span>
                          </div>
                          <div class="manager-details">
                            <div class="manager-name">{{ user.display_name }}</div>
                            <div class="manager-stats">
                              <div class="position-badges">
                                <span class="position-badge qb-badge"
                                  >QB:
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all' ? user.qb_rank : user.qb_starter_rank
                                    )
                                  }}</span
                                >
                                <span class="position-badge rb-badge"
                                  >RB:
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all' ? user.rb_rank : user.rb_starter_rank
                                    )
                                  }}</span
                                >
                                <span class="position-badge wr-badge"
                                  >WR:
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all' ? user.wr_rank : user.wr_starter_rank
                                    )
                                  }}</span
                                >
                                <span class="position-badge te-badge"
                                  >TE:
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all' ? user.te_rank : user.te_starter_rank
                                    )
                                  }}</span
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a-card>
                  </a-col>
                </a-row>
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
                    <div class="team-card">
                      <div class="team-card-header">
                        <img
                          class="manager-logos"
                          :src="`https://sleepercdn.com/avatars/thumbs/${manager.avatar}`"
                          alt="League Logo"
                        />
                        <div class="team-card-title">
                          <span class="manager-name">{{ manager.display_name }}</span>
                          <span class="team-rank">
                            &bull; {{ overallFilter === 'all' ? 'Overall' : 'Starters' }}
                            {{
                              addOrdinalSuffix(
                                overallFilter === 'all' ? manager.total_rank : manager.starters_rank
                              )
                            }}
                          </span>
                        </div>
                        <a-tag class="team-value">
                          {{
                            (overallFilter === 'all'
                              ? manager.total_value
                              : manager.starters_sum || 0
                            ).toLocaleString()
                          }}
                        </a-tag>
                      </div>
                      <ul
                        class="team-assets-list"
                        :class="{ expanded: expandedTeams[manager.user_id] }"
                      >
                        <li
                          v-for="(player, index) in getPlayers(manager.user_id).slice(
                            0,
                            expandedTeams[manager.user_id] ? getPlayers(manager.user_id).length : 10
                          )"
                          :key="player.sleeper_id"
                          :style="getPositionTagList(player.player_position, 0.35)"
                          class="team-asset-item"
                          @click="
                            player.player_position !== 'PICKS' ? showPlayerModal(player) : null
                          "
                        >
                          <span class="asset-index">{{ index + 1 }}.</span>
                          <span class="asset-name">{{ player.full_name }}</span>
                          <span class="asset-team">{{ player.team }}</span>
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
                      <div v-if="getPlayers(manager.user_id).length > 10" class="expand-toggle">
                        <a @click="toggleExpand(manager.user_id)">
                          {{ expandedTeams[manager.user_id] ? 'Show Less' : 'Show More' }}
                        </a>
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </a-tab-pane>

              <!-- Renamed tab from POSITIONS to POSITION GROUPS -->
              <a-tab-pane key="3" tab="Position Groups">
                <h2 class="tab-sub-header">Rankings by Position</h2>

                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col :span="24">
                    <a-card :bordered="false" class="managers-card">
                      <template #title>
                        <div class="card-header">
                          <span class="chart-title">League Managers</span>
                        </div>
                      </template>
                      <div class="managers-grid">
                        <div
                          v-for="user in sortedSummaryData"
                          :key="user.user_id"
                          class="manager-item"
                          :class="{
                            'current-user': user.user_id === leagueInfo.userId,
                            'selected-manager':
                              selectedUser && selectedUser.user_id === user.user_id
                          }"
                          @click="handleUserClick(user)"
                        >
                          <div class="manager-avatar">
                            <a-avatar
                              :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                              :size="45"
                            />
                            <span class="manager-rank">{{ getRank(user) }}</span>
                          </div>
                          <div class="manager-details">
                            <div class="manager-name">{{ user.display_name }}</div>
                            <div class="manager-stats">
                              <div class="position-badges">
                                <span class="position-badge qb-badge"
                                  >QB:
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all' ? user.qb_rank : user.qb_starter_rank
                                    )
                                  }}</span
                                >
                                <span class="position-badge rb-badge"
                                  >RB:
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all' ? user.rb_rank : user.rb_starter_rank
                                    )
                                  }}</span
                                >
                                <span class="position-badge wr-badge"
                                  >WR:
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all' ? user.wr_rank : user.wr_starter_rank
                                    )
                                  }}</span
                                >
                                <span class="position-badge te-badge"
                                  >TE:
                                  {{
                                    addOrdinalSuffix(
                                      overallFilter === 'all' ? user.te_rank : user.te_starter_rank
                                    )
                                  }}</span
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a-card>
                  </a-col>
                </a-row>

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
                    <span
                      class="legend-color"
                      style="background-color: rgba(70, 70, 70, 0.7)"
                    ></span>
                    <span class="legend-text">Picks</span>
                  </div>
                </div>

                <a-row style="justify-content: center" :gutter="[8, 16]">
                  <a-col
                    v-for="(players, position) in playersByPosition"
                    :key="position"
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="4"
                    :xl="4"
                    style="min-width: 220px"
                  >
                    <div class="position-group-container">
                      <h3 class="position-group-title">{{ position }}</h3>
                      <ul class="position-player-list">
                        <li
                          v-for="(player, index) in players"
                          :key="player.sleeper_id"
                          :style="getPositionTagList(player.player_position, 0.45)"
                          class="position-player-item"
                          :class="{
                            lighter: clickedManager !== '' && clickedManager !== player.display_name
                          }"
                          @click="
                            player.player_position !== 'PICKS' ? showPlayerModal(player) : null
                          "
                        >
                          <span
                            :class="{
                              'dimmed-text':
                                clickedManager !== '' && clickedManager !== player.display_name
                            }"
                            class="player-name"
                          >
                            {{ index + 1 }}. {{ player?.full_name }} {{ player?.team }}
                            <span
                              v-if="player.player_position.toLowerCase() !== 'picks'"
                              style="font-size: 11px"
                              >{{ player?.age }}yrs</span
                            >
                          </span>
                          <span class="player-value-display"
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

              <!-- Renamed tab from PLAYERS to LEAGUE ASSETS -->
              <a-tab-pane key="4" tab="League Assets">
                <h2 class="tab-sub-header">All Assets in League</h2>

                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col :span="24">
                    <a-card :bordered="false" class="managers-card">
                      <template #title>
                        <div class="card-header">
                          <span class="chart-title">League Managers (click to select)</span>
                        </div>
                      </template>
                      <div class="managers-grid">
                        <div
                          v-for="user in sortedSummaryData"
                          :key="user.user_id"
                          class="manager-item"
                          :class="{
                            'current-user': user.user_id === leagueInfo.userId,
                            'selected-manager':
                              selectedUser && selectedUser.user_id === user.user_id
                          }"
                          @click="handleUserClick(user)"
                        >
                          <div class="manager-avatar">
                            <a-avatar
                              :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                              :size="45"
                            />
                            <span class="manager-rank">{{ getRank(user) }}</span>
                          </div>
                          <div class="manager-details">
                            <div class="manager-name">{{ user.display_name }}</div>
                            <div class="manager-stats">
                              <span
                                >{{ overallFilter === 'all' ? 'Overall' : 'Starters' }}:
                                {{
                                  addOrdinalSuffix(
                                    overallFilter === 'all' ? user.total_rank : user.starters_rank
                                  )
                                }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </a-card>
                  </a-col>
                </a-row>

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
                    <span
                      class="legend-color"
                      style="background-color: rgba(70, 70, 70, 0.7)"
                    ></span>
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
                          @click="
                            player.player_position !== 'PICKS' ? showPlayerModal(player) : null
                          "
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

              <a-tab-pane key="5" tab="Waivers">
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
                              style="margin-bottom: 2px; border-radius: 2px"
                              @click="
                                player.player_position !== 'PICKS' ? showPlayerModal(player) : null
                              "
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
            </a-tabs>
            <a-button
              type="primary"
              shape="circle"
              class="info-button"
              @click="showTabInfoModal = true"
            >
              <InfoCircleOutlined />
            </a-button>
          </div>

          <!-- Information Modal -->
          <a-modal
            v-model:visible="showTabInfoModal"
            title="League View Guide"
            :footer="null"
            width="600px"
          >
            <div class="tab-info-container">
              <h3>Power Rankings</h3>
              <p>
                This tab provides an overall assessment of team strength and value across your
                league. View visual comparisons, position group breakdowns, and see how each team
                ranks in the league's power structure. Toggle between current values and future
                projections.
              </p>

              <h3>Team Composition</h3>
              <p>
                See how each manager's roster is constructed, with players ordered by their asset
                value. This view helps you understand the composition of your squad including draft
                picks and overall value distribution. Perfect for evaluating roster balance and
                identifying strengths or weaknesses.
              </p>

              <h3>Position Groups</h3>
              <p>
                This tab organizes all league players by position group (QB, RB, WR, TE, Picks),
                allowing you to see which managers control the most valuable assets at each
                position. Use this view to identify where you have positional advantages or where
                you need to strengthen your team compared to your league-mates.
              </p>

              <h3>League Assets</h3>
              <p>
                View the complete ranking of all players and picks across the entire league in a
                single list. This perspective helps identify "super teams" that control multiple
                high-value assets and understand the overall distribution of player value across all
                managers.
              </p>

              <h3>Waivers</h3>
              <p>
                Browse the best available players on waivers, organized by position. Quickly
                identify valuable free agents you might want to add to your roster.
              </p>
            </div>
          </a-modal>

          <!-- Player Detail Modal -->
          <a-modal
            v-model:open="isPlayerModalVisible"
            :title="selectedPlayer?.full_name || 'Player Details'"
            @ok="handlePlayerModalOk"
            :footer="null"
            width="400px"
          >
            <div v-if="selectedPlayer" class="player-modal-content">
              <div class="player-modal-header">
                <div class="player-image-placeholder">
                  <UserOutlined style="font-size: 48px; color: #ccc" />
                </div>
                <div class="player-modal-info">
                  <h2>{{ selectedPlayer.full_name }}</h2>
                  <p>
                    <a-tag :style="getPositionTagList(selectedPlayer.player_position)">{{
                      selectedPlayer.player_position
                    }}</a-tag>
                    <span v-if="selectedPlayer.team"> &bull; {{ selectedPlayer.team }}</span>
                    <span v-if="selectedPlayer.age"> &bull; {{ selectedPlayer.age }} yrs</span>
                  </p>
                </div>
              </div>
              <div class="player-modal-details">
                <p>
                  <strong>Value:</strong>
                  {{
                    selectedPlayer.player_value === -1
                      ? 'N/A'
                      : selectedPlayer.player_value?.toLocaleString()
                  }}
                </p>
                <p><strong>Manager:</strong> {{ selectedPlayer.display_name }}</p>
              </div>
            </div>
            <div v-else>
              <p>Loading player details...</p>
            </div>
          </a-modal>
        </a-spin>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
const activeKey = ref('1')
const showProjections = ref(false)
const showTabInfoModal = ref(false)
const isPlayerModalVisible = ref(false)
const selectedPlayer = ref(null)
const expandedMobileManagers = ref({})
const expandedMobileManagerPosition = ref({}) // New state for expanded position within a manager card

import { ref, reactive, onMounted, computed, watchEffect, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Party imports
import axios from 'axios'

// Platform Utils
import { message, Spin, Column, Empty, MenuProps } from 'ant-design-vue'
import {
  HomeOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
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

import { useCacheStore } from '@/stores/cacheStore'

const cacheStore = useCacheStore()

const bchartData = ref([])
const scatterPlotData = ref([])
const projectionBarChartData = ref([])
const projectionPercentColumnData = ref([])
// const radarChartData = ref([])

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'
import { getCellStyle } from '../utils/dynamicColorTable'
import { sleep } from '../utils/delay'

// --- START: Added Pick Sorting Logic ---

// Helper function to sort draft picks by Year, then Round/Tier/Pick#
function sortPicks(picks) {
  const roundOrder = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5 } // Extend if needed
  const tierOrder = { Early: 1, Mid: 2, Late: 3 }

  // Use spread operator [...] to create a shallow copy before sorting
  return [...picks].sort((a, b) => {
    const nameA = a.full_name || ''
    const nameB = b.full_name || ''

    // 1. Sort by Year
    const yearA = parseInt(nameA.substring(0, 4)) || 9999 // Default high if parsing fails
    const yearB = parseInt(nameB.substring(0, 4)) || 9999
    if (yearA !== yearB) return yearA - yearB

    // 2. Sort by Round (e.g., "1st", "2nd")
    const roundMatchA = nameA.match(/(\d+)(st|nd|rd|th)/)
    const roundMatchB = nameB.match(/(\d+)(st|nd|rd|th)/)
    const roundNumA = roundMatchA ? parseInt(roundMatchA[1]) : 99 // Default high if no match
    const roundNumB = roundMatchB ? parseInt(roundMatchB[1]) : 99
    if (roundNumA !== roundNumB) return roundNumA - roundNumB

    // 3. Sort by Tier (e.g., "Early", "Mid", "Late") - Handles 'YYYY Tier Round' format
    const tierMatchA = nameA.match(/(Early|Mid|Late)/)
    const tierMatchB = nameB.match(/(Early|Mid|Late)/)
    const tierValA = tierMatchA ? tierOrder[tierMatchA[1]] : 2 // Default Mid if no tier
    const tierValB = tierMatchB ? tierOrder[tierMatchB[1]] : 2
    if (tierValA !== tierValB) return tierValA - tierValB

    // 4. Sort by Pick Number (e.g., 1.05 vs 1.10) - Handles 'YYYY Round.Pick' format
    const pickNumMatchA = nameA.match(/(\d+)\.(\d+)/)
    const pickNumMatchB = nameB.match(/(\d+)\.(\d+)/)
    // Use round * 100 + pick for correct numerical comparison (e.g., 1.10 > 1.05)
    const pickValA = pickNumMatchA
      ? parseInt(pickNumMatchA[1]) * 100 + parseInt(pickNumMatchA[2])
      : 9999
    const pickValB = pickNumMatchB
      ? parseInt(pickNumMatchB[1]) * 100 + parseInt(pickNumMatchB[2])
      : 9999
    if (pickValA !== pickValB) return pickValA - pickValB

    // 5. Fallback to original value sort (descending) if all else is equal
    return b.player_value - a.player_value
  })
}

// --- END: Added Pick Sorting Logic ---

// --- START: Dynamic Percentile Threshold Calculation ---

// Helper function to calculate percentile
const calculatePercentileThresholds = (data, percentile = 75) => {
  if (!data || data.length === 0) return {}

  const thresholds = {}
  const positions = ['QB', 'RB', 'WR', 'TE'] // Exclude PICKS for thresholds

  positions.forEach((pos) => {
    const positionValues = data
      .filter((p) => p.player_position === pos && p.player_value > 0)
      .map((p) => p.player_value)
      .sort((a, b) => a - b)

    if (positionValues.length > 0) {
      const index = Math.ceil((percentile / 100) * positionValues.length) - 1
      thresholds[pos] = positionValues[Math.max(0, index)]
    } else {
      thresholds[pos] = Infinity
    }
  })
  return thresholds
}

// High value = 85th percentile, Low value = 15th percentile
const overallValueThresholds = computed(() => {
  return calculatePercentileThresholds(detailData.value, 85)
})
const projectionValueThresholds = computed(() => {
  return calculatePercentileThresholds(projDetailData.value, 85)
})
const overallLowValueThresholds = computed(() => {
  return calculatePercentileThresholds(detailData.value, 15)
})
const projectionLowValueThresholds = computed(() => {
  return calculatePercentileThresholds(projDetailData.value, 15)
})

// --- END: Dynamic Percentile Threshold Calculation ---

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

const filteredProjData = computed(() => {
  if (overallFilter.value === 'all') {
    return projDetailData.value
  } else {
    return projDetailData.value.filter((item) => {
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

const OverallScatterPlotData = computed(() => {
  const suffix = overallFilter.value === 'all' ? 'total_value' : 'starters_sum'

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
  if (showProjections.value) {
    const projUser = projSummaryData.value.find((p) => p.user_id === user.user_id)
    if (projUser) {
      return addOrdinalSuffix(
        overallFilter.value === 'all' ? projUser.total_rank : projUser.starters_rank
      )
    }
  }
  return addOrdinalSuffix(overallFilter.value === 'all' ? user.total_rank : user.starters_rank)
}

// Add a computed property for projection-sorted users
const sortedProjUsers = computed(() => {
  if (projSummaryData.value.length === 0 || summaryData.value.length === 0) return []

  // Create a merged array with projection data and avatars from summaryData
  return projSummaryData.value
    .map((projUser) => {
      const summaryUser = summaryData.value.find((s) => s.user_id === projUser.user_id)
      return {
        ...projUser,
        avatar: summaryUser?.avatar || ''
      }
    })
    .sort((a, b) => {
      if (overallFilter.value === 'all') {
        return a.total_rank - b.total_rank
      } else {
        return a.starters_rank - b.starters_rank
      }
    })
})

// Update the sortedSummaryData computed property
const sortedSummaryData = computed(() => {
  if (summaryData.value.length === 0) return []

  // If projections are being shown and projection data is available, use sorted projection data
  if (showProjections.value && sortedProjUsers.value.length > 0) {
    return sortedProjUsers.value
  }

  // Otherwise use regular summary data sorting
  return [...summaryData.value].sort((a, b) => {
    if (overallFilter.value === 'all') {
      return a.total_rank - b.total_rank
    } else {
      return a.starters_rank - b.starters_rank
    }
  })
})

// Update the handleViewToggle function to ensure we resort on toggle
const handleViewToggle = (checked) => {
  // If true, show projections data
  if (checked) {
    // Make sure projection data is loaded
    if (projSummaryData.value.length === 0 || projDetailData.value.length === 0) {
      fetchProjectionData(leagueInfo.leagueId, value1.value, leagueInfo.guid)
    }

    // If a user is selected, find the equivalent in projection data
    if (selectedUser.value) {
      const projUser = sortedProjUsers.value.find((p) => p.user_id === selectedUser.value.user_id)
      if (projUser) {
        // Keep the selection but update to projection data
        selectedUser.value = projUser
      }
    }
  } else {
    // Going back to regular view, update selection if needed
    if (selectedUser.value) {
      const regularUser = summaryData.value.find((s) => s.user_id === selectedUser.value.user_id)
      if (regularUser) {
        selectedUser.value = regularUser
      }
    }
  }
}

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
        : (record.qb_starter_sum / starterValue) * 100
    },
    {
      label: `RB: ${isAll ? record.rb_sum.toLocaleString() : record.rb_starters_sum.toLocaleString()}`,
      color: 'rgb(144, 190, 109)',
      value: isAll
        ? (record.rb_sum / totalValue) * 100
        : (record.rb_starter_sum / starterValue) * 100
    },
    {
      label: `WR: ${isAll ? record.wr_sum.toLocaleString() : record.wr_startes_sum.toLocaleString()}`,
      color: 'rgb(67, 170, 139)',
      value: isAll
        ? (record.wr_sum / totalValue) * 100
        : (record.wr_starter_sum / starterValue) * 100
    },
    {
      label: `TE: ${isAll ? record.te_sum.toLocaleString() : record.te_starters_sum.toLocaleString()}`,
      color: 'rgb(249, 132, 74)',
      value: isAll
        ? (record.te_sum / totalValue) * 100
        : (record.te_starter_sum / starterValue) * 100
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

const projColumns = computed(() => {
  // Define base columns common to all views
  let baseProjColumns = [
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
  return baseProjColumns
})

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
        'border-color': `rgb(39, 125, 161)`
      }
    case 'RB':
      return {
        background: `rgba(144, 190, 109, ${opacity})`,
        'border-color': `rgb(144, 190, 109)`
      }
    case 'WR':
      return {
        background: `rgba(67, 170, 139, ${opacity})`,
        'border-color': `rgb(67, 170, 139)`
      }
    case 'TE':
      return {
        background: `rgba(249, 132, 74, ${opacity})`,
        'border-color': `rgb(249, 132, 74)`
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

// --- START: Modified getPlayers and getPlayersProj ---

const getPlayers = (userId) => {
  const userAssets = filteredData.value.filter((item) => item.user_id === userId)
  const players = userAssets.filter((a) => a.player_position !== 'PICKS')
  const picks = userAssets.filter((a) => a.player_position === 'PICKS')

  // Sort players by value descending
  const sortedPlayers = players.sort((a, b) => b.player_value - a.player_value)
  // Sort picks using the custom logic
  const sortedPicks = sortPicks(picks)

  // Combine: Players first, then picks sorted by year/round
  return [...sortedPlayers, ...sortedPicks]
}

const getPlayersProj = (userId) => {
  const userAssets = filteredProjData.value.filter((item) => item.user_id === userId)
  const players = userAssets.filter((a) => a.player_position !== 'PICKS')
  const picks = userAssets.filter((a) => a.player_position === 'PICKS')

  // Sort players by value descending
  const sortedPlayers = players.sort((a, b) => b.player_value - a.player_value)
  // Sort picks using the custom logic
  const sortedPicks = sortPicks(picks)

  // Combine: Players first, then picks sorted by year/round
  return [...sortedPlayers, ...sortedPicks]
}

// --- END: Modified getPlayers and getPlayersProj ---

// Compute chunks of 50 players based on the new sorted list
const sortedFilteredData = computed(() => {
  const players = filteredData.value.filter((a) => a.player_position !== 'PICKS')
  const picks = filteredData.value.filter((a) => a.player_position === 'PICKS')

  // Ensure players are sorted by value descending
  const sortedPlayers = players.sort((a, b) => b.player_value - a.player_value)
  // Sort picks using the custom logic
  const sortedPicks = sortPicks(picks)

  return [...sortedPlayers, ...sortedPicks]
})

const playerChunks = computed(() => {
  const size = 50
  return sortedFilteredData.value.reduce((acc, val, i) => {
    let idx = Math.floor(i / size)
    let page = acc[idx] || (acc[idx] = [])
    page.push(val)
    return acc
  }, [])
})

// --- START: Modified playersByPosition ---

const playersByPosition = computed(() => {
  const order = ['QB', 'RB', 'WR', 'TE', 'PICKS']
  const groups = {}
  order.forEach((position) => {
    groups[position] = []
  })

  // Group players first using the overall value-sorted list
  filteredData.value.forEach((player) => {
    if (groups.hasOwnProperty(player.player_position)) {
      groups[player.player_position].push(player)
    }
  })

  // Now, sort within each group
  order.forEach((position) => {
    if (groups[position]) {
      // Check if group exists (might be empty)
      if (position === 'PICKS') {
        // Apply custom sort for picks
        groups[position] = sortPicks(groups[position])
      } else {
        // Ensure players are sorted by value descending (might be redundant if filteredData is pre-sorted)
        groups[position].sort((a, b) => b.player_value - a.player_value)
      }
      // Filter out empty groups after potential sorting
      if (groups[position].length === 0) {
        delete groups[position]
      }
    } else {
      delete groups[position] // Remove placeholder if it remained empty
    }
  })

  return groups
})

// --- END: Modified playersByPosition ---

const insertLeagueDetials = async (values: any) => {
  // Clear specific cache entries for this league to ensure fresh data
  const leagueIdStr = leagueInfo.leagueId.toString()
  Object.keys(cacheStore.cache).forEach((key) => {
    if (key.includes(leagueIdStr)) {
      cacheStore.remove(key)
    }
  })

  isLoading.value = true
  detailIsLoading.value = true
  summaryIsLoading.value = true
  console.log('trying insert rosters')

  const cacheBuster = Date.now().toString() // Generate cache buster timestamp

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

    // Pass cacheBuster to subsequent fetch calls
    fetchSummaryData(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rankType,
      leagueInfo.guid,
      leagueInfo.rosterType,
      leagueInfo.leagueType, // Ensure leagueType is passed if needed
      cacheBuster
    )
    fetchDetailData(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rankType,
      leagueInfo.guid,
      leagueInfo.rosterType,
      cacheBuster
    )
    fetchBaData(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rankType,
      leagueInfo.guid,
      leagueInfo.rosterType,
      cacheBuster
    )
    fetchTrades(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rosterType,
      leagueInfo.leagueYear,
      leagueInfo.rankType,
      cacheBuster
    )
    fetchProjectionData(leagueInfo.leagueId, value1.value, leagueInfo.guid, cacheBuster)
  }
}

async function fetchProjectionData(
  leagueId: string,
  projectionSource: string,
  guid: string,
  cacheBuster?: string // Add cacheBuster parameter
) {
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 2000 // Delay in milliseconds

  const params: any = {
    league_id: leagueId,
    projection_source: projectionSource,
    guid: guid
  }
  if (cacheBuster) {
    params._cb = cacheBuster // Add _cb if provided
  }

  while (retryCount < maxRetries) {
    try {
      console.log('Fetching projection data...')
      const [summaryResponse, detailResponse] = await Promise.all([
        axios.get(`${apiUrl}/contender_league_summary`, { params }), // Use updated params
        axios.get(`${apiUrl}/contender_league_detail`, { params }) // Use updated params
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
  leagueType: string, // Assuming this is defined somewhere as it's used in your params
  cacheBuster?: string // Add cacheBuster parameter
) {
  summaryIsLoading.value = true

  // Create a unique cache key based on parameters
  const cacheKey = `summary_${leagueId}_${platform}_${rankType}_${guid}_${rosterType}_${leagueType}`

  // If a cache buster is provided, bypass the cache check
  if (!cacheBuster && cacheStore.has(cacheKey)) {
    console.log('Using cached summary data')
    const cachedData = cacheStore.get(cacheKey)
    summaryData.value = cachedData
    updateBchartData(cachedData)
    updateScatterPlotData(cachedData)
    summaryIsLoading.value = false
    return
  }

  // If no cache or cache expired, fetch from API
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500 // Delay in milliseconds

  const params: any = {
    league_id: leagueId,
    platform: platform,
    rank_type: rankType,
    guid: guid,
    roster_type: rosterType,
    league_type: leagueType
  }
  if (cacheBuster) {
    params._cb = cacheBuster // Add _cb if provided
  }

  try {
    while (retryCount < maxRetries) {
      try {
        const response = await axios.get(`${apiUrl}/league_summary`, { params }) // Use updated params

        const rawData = response.data

        const processedData = rawData.map((item) => {
          return {
            ...item,
            total_rank_display: addOrdinalSuffix(item.total_rank),
            // other mappings...
            picks_percent: (item.picks_sum / item.total_value) * 100
          }
        })

        // Save to cache
        cacheStore.set(cacheKey, processedData)

        summaryData.value = processedData
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
    const userSummary = summaryData.value.find((item) => item.user_id === leagueInfo.userId)

    if (!userSummary) {
      console.error('No summary data found for user:', leagueInfo.userId)
      summaryIsLoading.value = false
      return
    }

    summaryIsLoading.value = false

    try {
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
    } catch (error) {
      console.error('Error updating ranks summary:', error.message)
    }
  }

  if (retryCount === maxRetries) {
    console.error('Maximum retries reached for fetching league summary data')
  }
}

async function fetchBaData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string,
  cacheBuster?: string // Add cacheBuster parameter
) {
  baIsLoading.value = true // Assuming you have a reactive variable to track loading state

  // Create a unique cache key based on parameters
  const cacheKey = `ba_${leagueId}_${platform}_${rankType}_${guid}_${rosterType}`

  // If a cache buster is provided, bypass the cache check
  if (!cacheBuster && cacheStore.has(cacheKey)) {
    console.log('Using cached best available data')
    bestAvailableData.value = cacheStore.get(cacheKey)
    baIsLoading.value = false
    return
  }

  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500 // Delay in milliseconds

  const params: any = {
    league_id: leagueId,
    platform: platform,
    rank_type: rankType,
    guid: guid,
    roster_type: rosterType
  }
  if (cacheBuster) {
    params._cb = cacheBuster // Add _cb if provided
  }

  while (retryCount < maxRetries) {
    try {
      const response = await axios.get(`${apiUrl}/best_available`, { params }) // Use updated params

      // Store in cache before assigning to reactive variable
      cacheStore.set(cacheKey, response.data)
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
  rankType: string,
  cacheBuster?: string // Add cacheBuster parameter
) {
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500 // Delay in milliseconds

  const params: any = {
    league_id: leagueId,
    platform: platform,
    roster_type: rosterType,
    league_year: leagueYear,
    rank_type: rankType
  }
  if (cacheBuster) {
    params._cb = cacheBuster // Add _cb if provided
  }

  while (retryCount < maxRetries) {
    try {
      console.log('Pulling trades')
      const [summaryResponse, detailResponse] = await Promise.all([
        axios.get(`${apiUrl}/trades_summary`, { params }), // Use updated params
        axios.get(`${apiUrl}/trades_detail`, { params }) // Use updated params
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

    const url = `/leaguesummary/${encodeURIComponent(userName)}/${encodeURIComponent(userId)}/${encodeURIComponent(leagueId)}/${encodeURIComponent(leagueName)}/${encodeURIComponent(leagueYear)}/${encodeURIComponent(leagueStarters)}/${encodeURIComponent(leagueSize)}/${encodeURIComponent(rosterType)}/${encodeURIComponent(guid)}/${encodeURIComponent(rosterType)}/${encodeURIComponent(avatar)}/${encodeURIComponent(rankType)}`

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
  rosterType: string,
  cacheBuster?: string // Add cacheBuster parameter
) {
  detailIsLoading.value = true

  // Create a unique cache key based on parameters
  const cacheKey = `detail_${leagueId}_${platform}_${rankType}_${guid}_${rosterType}`

  // If a cache buster is provided, bypass the cache check
  if (!cacheBuster && cacheStore.has(cacheKey)) {
    console.log('Using cached detail data')
    detailData.value = cacheStore.get(cacheKey)
    detailIsLoading.value = false
    return
  }

  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500 // delay in milliseconds

  const params: any = {
    league_id: leagueId,
    platform: platform,
    rank_type: rankType,
    guid: guid,
    roster_type: rosterType
  }
  if (cacheBuster) {
    params._cb = cacheBuster // Add _cb if provided
  }

  while (retryCount < maxRetries) {
    try {
      const response = await axios.get(`${apiUrl}/league_detail`, { params }) // Use updated params

      // Store in cache before assigning to reactive variable
      cacheStore.set(cacheKey, response.data)
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
      ((actualValue.value - min) / (max - visualStartPercentage)) * (100 - visualStartPercentage) +
      visualStartPercentage
    return `${scaledValue.toFixed(2)}%`
  }
})

// Add this reactive state for expanded cards
const expandedTeams = reactive({})

// Toggle function for expand/collapse
function toggleExpand(userId: string) {
  expandedTeams[userId] = !expandedTeams[userId]
}

// --- START: Added Player Modal Logic ---
const showPlayerModal = (player) => {
  selectedPlayer.value = player
  isPlayerModalVisible.value = true
}

const handlePlayerModalOk = () => {
  isPlayerModalVisible.value = false
}
// --- END: Added Player Modal Logic ---

const toggleMobileManagerExpand = (userId: string) => {
  expandedMobileManagers.value[userId] = !expandedMobileManagers.value[userId]
  // If collapsing the manager card, also clear any expanded position for that manager
  if (!expandedMobileManagers.value[userId]) {
    expandedMobileManagerPosition.value[userId] = null
  }
}

const toggleMobileManagerPositionExpand = (userId: string, position: string) => {
  if (expandedMobileManagerPosition.value[userId] === position) {
    expandedMobileManagerPosition.value[userId] = null // Collapse if same position clicked
  } else {
    expandedMobileManagerPosition.value[userId] = position // Expand new position
  }
}

// Helper to get players for a specific position for the mobile view, respecting filters
const getPlayersForMobilePosition = (userId, position) => {
  const allPlayersForUser = showProjections.value ? getPlayersProj(userId) : getPlayers(userId)
  return allPlayersForUser.filter((p) => p.player_position === position)
}
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

.at-table-tbody {
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

/* Add modern card styling */
.modern-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.viz-container {
  border: none;
  padding: 10px;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color, #333);
}

/* Make sure toggle switch is prominent */
.ant-switch {
  transform: scale(1.2);
  margin: 0 auto;
}

/* Add these styles at the end of the style section */
.managers-card {
  margin-bottom: 20px;
  background-color: var(--background-color, #fff);
}

.managers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
}

.manager-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s;
  cursor: pointer;
}

.manager-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.current-user {
  border: 2px solid gold;
  background-color: rgba(255, 215, 0, 0.1);
}

.manager-avatar {
  position: relative;
  margin-right: 10px;
}

.manager-rank {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background-color: rgb(70, 70, 70);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.manager-details {
  flex: 1;
  overflow: hidden;
}

.manager-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manager-stats {
  font-size: 12px;
  color: #666;
}

.selected-manager {
  background-color: rgba(24, 144, 255, 0.1);
  border: 2px solid #1890ff;
}

.position-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 3px;
}

.position-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  color: white;
}

.qb-badge {
  background-color: rgba(39, 125, 161, 0.8);
}

.rb-badge {
  background-color: rgba(144, 190, 109, 0.8);
}

.wr-badge {
  background-color: rgba(67, 170, 139, 0.8);
}

.te-badge {
  background-color: rgba(249, 132, 74, 0.8);
}

/* Make sure toggle switch has some margin */
.ant-switch {
  transform: scale(1.2);
  margin: 0 10px;
}

/* Add these styles at the end of the style section */
.tab-header-container {
  position: relative;
}

.info-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.tab-info-container h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--text-color, #1890ff);
}

.tab-info-container p {
  margin-bottom: 16px;
  line-height: 1.5;
}

/* --- Team Card Redesign for Team Composition Tab --- */
.team-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 10px 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 10px 12px 8px 12px;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  transition: box-shadow 0.2s;
}
.team-card:hover {
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.1);
}
.team-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.team-card-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.manager-name {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.team-rank {
  font-size: 12px;
  color: #888;
}
.team-value {
  margin-left: auto;
  font-size: 13px;
  background: #f0f5ff;
  color: #1890ff;
  border-radius: 6px;
  padding: 2px 8px;
}
.team-assets-list {
  padding: 0;
  margin: 0;
  list-style: none;
  max-height: 340px;
  overflow: hidden;
}

.team-assets-list.expanded {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px; /* Add some padding for the scrollbar */
}

.team-asset-item {
  display: flex;
  align-items: center;
  border-radius: 2px;
  margin: 2px 0;
  padding: 2px 0 2px 4px;
  font-size: 13px;
  gap: 4px;
  cursor: pointer; /* Make the whole item indicate clickability */
}
.expand-toggle {
  text-align: center;
  margin-top: 4px;
}
.expand-toggle a {
  color: #1890ff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.2s;
}
.expand-toggle a:hover {
  color: #40a9ff;
}
/* --- End Team Card Redesign --- */

/* Update position group styling for more compact display */
.position-group-container {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 16px;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.position-group-title {
  font-size: 16px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
  font-weight: 600;
}

.position-player-list {
  padding: 0;
  margin: 0;
  list-style: none;
  overflow-y: auto;
  max-height: 450px;
}

.position-player-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 5px 8px;
  border-radius: 4px;
  margin: 2px 0;
  font-size: 12px;
  cursor: pointer; /* Make the whole item indicate clickability */
}

.player-name {
  flex: 1;
  white-space: normal;
  overflow-wrap: break-word;
  padding-right: 4px;
}

.player-value-display {
  font-weight: 500;
  white-space: nowrap;
  font-size: 11px;
}

/* Responsive adjustments */
@media (max-width: 1400px) {
  .position-player-list {
    max-height: 300px;
  }
}

@media (max-width: 992px) {
  .position-player-item {
    font-size: 11px;
  }
}

/* New Heat Map Styles */
.expanded-row-content {
  padding: 12px 8px;
  background-color: #fafafa;
  border-radius: 8px;
}

.position-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaeaea;
}

.position-summary-item {
  flex: 1;
  min-width: 140px;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  background-color: white;
  max-width: 340px;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #f0f0f0;
}

.position-name {
  font-weight: 600;
  font-size: 15px;
}

.position-rank {
  margin: 0;
}

.position-stats {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 8px;
  font-size: 13px;
}

.age-label,
.value-label {
  color: #777;
}

.age-value,
.value-amount {
  font-weight: 500;
  text-align: right;
}

.value-amount {
  font-weight: 600;
}

/* Position-specific styling */
.position-qb {
  border-left: 3px solid rgb(39, 125, 161);
}

.position-rb {
  border-left: 3px solid rgb(144, 190, 109);
}

.position-wr {
  border-left: 3px solid rgb(67, 170, 139);
}

.position-te {
  border-left: 3px solid rgb(249, 132, 74);
}

.position-picks {
  border-left: 3px solid rgb(143, 145, 146);
}

/* Players Grid styling */
.players-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.position-players-column {
  flex: 1;
  min-width: 165px;
  max-width: 340px;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-card {
  padding: 6px 8px;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  position: relative; /* Needed for the ::before pseudo-element */
  overflow: hidden; /* Ensure the ::before doesn't overflow the rounded corners */
  cursor: pointer; /* Make the whole card indicate clickability */
}

.player-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.player-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.player-name-team {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.player-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-team {
  font-size: 11px;
  opacity: 0.8;
}

.player-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 45px;
}

.player-age {
  font-size: 10px;
  opacity: 0.7;
}

.player-value {
  font-weight: 600;
  font-size: 12px;
}

/* Style for highlighting high-value assets */
.high-value-asset {
  padding-left: 12px;
}
.high-value-asset::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background-color: gold;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

/* Style for highlighting low-value assets */
.low-value-asset {
  padding-left: 12px;
}
.low-value-asset::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background-color: #e74d3cdd;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

/* --- ADD: Style for highlighting mid-value assets --- */
.mid-value-asset {
  padding-left: 12px;
}
.mid-value-asset::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background-color: #bdbdbd;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
/* --- END: Style for highlighting mid-value assets --- */

/* Highlighted row for current user */
.highlighted-row {
  background-color: rgba(24, 144, 255, 0.05);
}

.highlighted-row td,
.manager-card-mobile.highlighted-row {
  /* Apply to mobile card too */
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .position-summary {
    flex-direction: column;
    gap: 8px;
  }

  .position-summary-item {
    width: 100%;
  }

  .players-grid {
    flex-direction: column;
  }

  .position-players-column {
    width: 100%;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eaeaea;
  }

  .position-players-column:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .player-card {
    padding: 8px 10px;
    margin-bottom: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .player-info {
    font-size: 14px;
  }

  .player-name {
    font-size: 14px;
    max-width: 160px;
  }

  .player-team {
    font-size: 12px;
  }

  .player-meta {
    min-width: 60px;
  }

  .player-age {
    font-size: 12px;
  }

  .player-value {
    font-size: 14px;
    font-weight: 700;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .expanded-row-content {
    padding: 8px 4px;
  }

  .player-card {
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .player-name-team {
    width: 65%;
  }

  .player-name {
    white-space: normal;
    line-height: 1.2;
  }

  .position-summary-item {
    padding: 10px;
    margin-bottom: 4px;
    width: auto;
  }

  .players-grid::before {
    content: 'Players';
    display: block;
    font-weight: 600;
    margin: 8px 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid #eaeaea;
    color: #555;
  }

  .position-players-column::before {
    content: attr(data-position);
    display: block;
    font-weight: 600;
    margin: 12px 0 8px;
    color: #444;
    font-size: 15px;
  }
}

/* New Data Controls Card Styling */
.data-controls-card {
  margin-bottom: 24px; /* Increased margin */
  background-color: var(--background-color-secondary, #f9f9f9); /* Subtle background */
  border: 1px solid var(--border-color, #e8e8e8); /* Softer border */
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); /* Softer shadow */
}

.data-controls-card .ant-card-body {
  padding: 20px 24px !important; /* Adjusted padding */
}

.control-group {
  display: flex;
  flex-direction: column; /* Default to column for mobile */
  align-items: flex-start; /* Align items to start */
  gap: 6px; /* Reduced gap */
  width: 100%;
}

.control-label {
  font-weight: 500;
  font-size: 13px; /* Slightly smaller font */
  color: var(--text-color-secondary, #555); /* Adjusted color */
  margin-bottom: 0; /* Remove bottom margin */
  line-height: 1.4; /* Ensure consistent line height */
}

/* Style adjustments for controls */
.ant-switch {
  transform: scale(1); /* Reset scale */
  margin: 0; /* Reset margin */
}

.ant-radio-group {
  display: inline-flex; /* Use inline-flex for better alignment */
}

.ant-select,
.ant-dropdown-button .ant-btn {
  min-width: 120px; /* Ensure minimum width for dropdowns */
}

/* Responsive adjustments */
@media (max-width: 1199px) {
  /* Adjust breakpoint for better stacking */
  .control-group {
    align-items: center; /* Center align on medium/small screens */
    margin-bottom: 16px; /* Add margin between stacked items */
  }
  .control-group:last-child {
    margin-bottom: 0;
  }
  .ant-radio-group,
  .ant-select,
  .ant-dropdown-button {
    width: auto; /* Allow natural width */
    max-width: 250px; /* Prevent excessive width */
  }
}

@media (min-width: 1200px) {
  /* Adjust breakpoint */
  .control-group {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 10px; /* Slightly increased gap for row layout */
  }
  .control-label {
    min-width: 110px; /* Ensure labels align nicely */
    text-align: right; /* Right-align labels */
    margin-right: 4px;
  }
}
/* End of Data Controls Card Styling */

/* Style for highlighting high-value assets */
.high-value-asset {
  padding-left: 12px; /* Add padding to make space for the indicator */
}

.high-value-asset::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px; /* Width of the gold tab */
  background-color: gold; /* Color of the tab */
  border-top-left-radius: 4px; /* Match card's border-radius */
  border-bottom-left-radius: 4px; /* Match card's border-radius */
}

/* --- ADD: Style for highlighting low-value assets --- */
.low-value-asset {
  padding-left: 12px; /* Add padding to make space for the indicator */
}

.low-value-asset::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px; /* Width of the red tab */
  background-color: #e74c3c; /* Red color */
  border-top-left-radius: 4px; /* Match card's border-radius */
  border-bottom-left-radius: 4px; /* Match card's border-radius */
}

/* --- ADD: Style for highlighting mid-value assets --- */
.mid-value-asset {
  padding-left: 12px;
}
.mid-value-asset::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background-color: #bdbdbd;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
/* --- END: Style for highlighting mid-value assets --- */

/* ADDED: Styles for clickable player name */
.clickable-player-name {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(24, 144, 255, 0.5); /* Optional: subtle underline */
  transition: color 0.2s;
}

.clickable-player-name:hover {
  color: #1890ff; /* Ant Design primary blue */
  text-decoration-color: #1890ff;
}

/* ADDED: Styles for Player Modal */
.player-modal-content {
  padding: 10px;
}

.player-modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.player-image-placeholder {
  width: 60px;
  height: 60px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
}

.player-modal-info h2 {
  margin-bottom: 4px;
  font-size: 1.3em;
}

.player-modal-info p {
  margin: 0;
  color: #555;
}

.player-modal-details p {
  margin-bottom: 8px;
  font-size: 14px;
}

.player-modal-details strong {
  margin-right: 5px;
  color: #333;
}

/* ADDED: Styles for Mobile Heatmap View */
.heatmap-mobile-view {
  display: none; /* Hidden by default */
}

.manager-card-mobile {
  background-color: var(--card-background-color, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  margin-bottom: 16px; /* Increased spacing between cards */
  padding: 12px 16px; /* Adjusted padding */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease-in-out;
}

.manager-card-mobile:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.manager-card-mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer; /* Indicate the header is clickable to expand/collapse */
}

.manager-card-mobile.highlighted-row {
  border-left: 4px solid #1890ff; /* Prominent highlight for current user */
}

.manager-name-mobile {
  font-weight: 900;
  font-size: 1.25em; /* Slightly adjusted font size */
  color: var(--text-color, #333);
}

.manager-rank-value-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.manager-rank-value-mobile .ant-tag {
  font-size: 0.9em; /* Adjust tag size */
}

.manager-value-mobile {
  font-size: 1.05em; /* Adjust value font size */
  font-weight: 1000;
  color: var(--text-color-secondary, #555);
}

.manager-card-mobile-details-reused {
  margin-top: 12px;
  padding-top: 12px; /* Add padding if not handled by expanded-row-content */
  border-top: 1px solid #f0f0f0; /* Separator for details section */
}

/* Add styles for clickable position summary items and active state */
.position-summary-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.position-summary-item:hover {
  background-color: rgba(0, 0, 0, 0.03); /* Light hover effect */
}

.position-summary-item.active-position-summary {
  background-color: rgba(24, 144, 255, 0.08);
  border-radius: 4px;
}

.nested-players-container {
  margin-top: 12px; /* Space between position stats and player list */
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0; /* Softer separator line */
}

.nested-players-container .players-list {
  display: flex;
  flex-direction: column;
  gap: 6px; /* Spacing between player cards */
}

.nested-players-container .player-card {
  /* Styles for player cards within the nested list are inherited, 
     but you can add specific overrides if needed */
  background-color: var(
    --background-color-secondary,
    #f9f9f9
  ); /* Slightly different bg for nested players */
}

.no-players-notice {
  padding: 10px 8px;
  text-align: center;
  color: #888; /* Slightly darker for better readability */
  font-style: italic;
  font-size: 0.9em;
  background-color: var(--background-color-tertiary, #f5f5f5);
  border-radius: 4px;
  margin-top: 8px;
}

/* Media query for mobile heatmap */
@media (max-width: 768px) {
  /* Adjust breakpoint as needed */
  .heatmap-desktop-view {
    display: none;
  }
  .heatmap-mobile-view {
    display: block;
  }
}
</style>
