<template>
  <a-layout class="layout">
    <AppHeader />
    <theme-toggle-button />

    <a-layout-content class="responsive-padding" :style="{ marginTop: '12px' }">
      <!-- Breadcrumbs -->
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item
          ><a href="/"><home-outlined /></a
        ></a-breadcrumb-item>
        <a-breadcrumb-item><a :href="leaguesUrl">Leagues</a></a-breadcrumb-item>
        <a-breadcrumb-item>{{ leagueInfo.leagueName }}</a-breadcrumb-item>
        <a-breadcrumb-item>{{ leagueInfo.userName }}</a-breadcrumb-item>
      </a-breadcrumb>

      <div>
        <!-- League Header Info -->
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
                  <a-tag color="cyan" size="large">{{ selectedSource.name }}</a-tag>
                  <a-tag>{{ leagueInfo.rosterType }}</a-tag>
                  <a-tag>{{ leagueInfo.rankType }}</a-tag>
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

            <!-- Data Controls Card -->
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
            <!-- End Data Controls Card -->
          </div>
        </div>

        <a-spin tip="Loading..." :spinning="summaryIsLoading">
          <div class="tab-header-container">
            <a-tabs v-model:activeKey="activeKey">
              <!-- Power Rankings Tab -->
              <a-tab-pane key="1" tab="Power Rankings">
                <h2 class="tab-sub-header">Power Ranks</h2>

                <!-- League Managers Grid -->
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

                <!-- Charts Row -->
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

                <!-- Heatmap Title -->
                <h2 class="text-center-margin-top-30">
                  {{ showProjections ? 'Projections' : 'Rankings' }} Heat Map
                </h2>

                <!-- Desktop Heatmap Table -->
                <div class="heatmap-desktop-view">
                  <div class="table-section heatmap-table-container">
                    <a-table
                      :columns="showProjections ? projColumns : columns"
                      :dataSource="showProjections ? projSummaryData : summaryData"
                      :pagination="false"
                      row-key="user_id"
                      :expand-column-width="100"
                      class="full-width-table"
                      :scroll="{ x: '1150px' }"
                      :rowClassName="
                        (record) => (record.user_id === leagueInfo.userId ? 'highlighted-row' : '')
                      "
                    >
                      <!-- Expanded Row Content for Desktop -->
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
                                  :style="getPositionTagList(player.player_position, 0.15)"
                                  :class="{
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
                  <!-- ... existing mobile heatmap header ... -->
                  <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                    <a-col class="gutter-row" :span="8"></a-col>
                    <a-col class="gutter-row font-bold" :span="4">Overall</a-col>
                    <a-col class="gutter-row font-bold" :span="4">Starters</a-col>
                    <a-col class="gutter-row font-bold" :span="4">Bench</a-col>
                    <a-col class="gutter-row font-bold" :span="4">Picks</a-col>
                  </a-row>
                  <div
                    v-for="user in sortedSummaryData"
                    :key="user.user_id"
                    class="manager-card-mobile"
                    :class="{ 'highlighted-row': user.user_id === leagueInfo.userId }"
                    @click="toggleMobileManagerExpand(user.user_id)"
                  >
                    <!-- Manager Info: Avatar and Name -->
                    <div class="manager-info-line-mobile">
                      <a-avatar
                        :src="`https://sleepercdn.com/avatars/thumbs/${user.avatar}`"
                        :size="24"
                        class="margin-right-8"
                      />
                      <span class="manager-name-mobile font-bold">{{ user.display_name }}</span>
                    </div>

                    <!-- Stats Row -->
                    <a-row :gutter="{ xs: 2, sm: 8 }" class="manager-stats-grid-mobile">
                      <a-col class="gutter-row" :span="8">
                        <a-tag class="font-size-1-1em">
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
                    <!-- Expanded Details for Mobile -->
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
                            <!-- Player list for this specific position (Mobile) -->
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
                                  :style="getPositionTagList(player.player_position, 0.15)"
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

              <!-- Team Composition Tab -->
              <a-tab-pane key="2" tab="Team Composition">
                <!-- ... existing Team Composition tab content ... -->
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
                    class="team-card-column"
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
                          :style="getPositionTagList(player.player_position, 0.2)"
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

              <!-- Position Groups Tab -->
              <a-tab-pane key="3" tab="Position Groups">
                <!-- ... existing Position Groups tab content ... -->
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
                            class="avatar-bordered"
                          />
                        </div>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">QB</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">RB</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">WR</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">TE</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">Picks</span>
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
                          <a-avatar :size="24" class="avatar-bordered" />
                        </div>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">QB</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">RB</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">WR</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">TE</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">Picks</span>
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
                    <span class="legend-color legend-qb"></span>
                    <span class="legend-text">QB</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color legend-rb"></span>
                    <span class="legend-text">RB</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color legend-wr"></span>
                    <span class="legend-text">WR</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color legend-te"></span>
                    <span class="legend-text">TE</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color legend-picks"></span>
                    <span class="legend-text">Picks</span>
                  </div>
                </div>

                <a-row class="justify-center-row" :gutter="[8, 16]">
                  <a-col
                    v-for="(players, position) in playersByPosition"
                    :key="position"
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="4"
                    :xl="4"
                    class="position-group-col"
                  >
                    <div class="position-group-container">
                      <h3 class="position-group-title">{{ position }}</h3>
                      <ul class="position-player-list">
                        <li
                          v-for="(player, index) in players"
                          :key="player.sleeper_id"
                          :style="getPositionTagList(player.player_position, 0.2)"
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
                              class="font-size-11"
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

              <!-- League Assets Tab -->
              <a-tab-pane key="4" tab="League Assets">
                <!-- ... existing League Assets tab content ... -->
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
                            class="avatar-bordered"
                          />
                        </div>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">QB</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">RB</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">WR</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">TE</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">Picks</span>
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
                          <a-avatar :size="24" class="avatar-bordered" />
                        </div>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">QB</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">RB</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">WR</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">TE</span>
                      </a-col>
                      <a-col class="gutter-box-stats" :span="3">
                        <span class="font-bold">Picks</span>
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
                    <span class="legend-color legend-qb"></span>
                    <span class="legend-text">QB</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color legend-rb"></span>
                    <span class="legend-text">RB</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color legend-wr"></span>
                    <span class="legend-text">WR</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color legend-te"></span>
                    <span class="legend-text">TE</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color legend-picks"></span>
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
                    <div class="player-chunk-container">
                      <ul class="no-padding-ul">
                        <li
                          v-for="(player, index) in chunk"
                          :key="player.sleeper_id"
                          :style="getPositionTagList(player.player_position, 0.2)"
                          class="player-chunk-item"
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

              <!-- Waivers Tab -->
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
                          <span class="font-size-18 font-bolder">{{ position }}</span>
                        </template>
                        <span v-for="player in players" :key="player.sleeper_id">
                          <ul class="no-padding-ul no-list-style">
                            <li
                              :key="player.sleeper_id"
                              :style="getPositionTagList(player.player_position, 0.2)"
                              class="waiver-player-item"
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
            <!-- Info Button for Tab Guide -->
            <a-button
              type="primary"
              shape="circle"
              class="info-button"
              @click="showTabInfoModal = true"
            >
              <InfoCircleOutlined />
            </a-button>
          </div>

          <!-- Information Modal (Tab Guide) -->
          <a-modal
            v-model:visible="showTabInfoModal"
            title="League View Guide"
            :footer="null"
            width="600px"
          >
            <!-- ... existing info modal content ... -->
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
            <!-- ... existing player detail modal content ... -->
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
// Vue Core and Router
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Local Components
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import BarChart from '@/components/BarChart.vue'
import ProjectionBarChart from '@/components/ProjectionBarChart.vue'
import ProjectionPercentColumn from '@/components/ProjectionPercentColumn.vue'
import OverallScatterPlot from '@/components/OverallScatterPlot.vue'

// Third-Party Libraries
import axios from 'axios'
import { message, Empty, MenuProps } from 'ant-design-vue' // Assuming 'Column' type was from here or a local definition
import 'primeicons/primeicons.css'

// Stores
import { useCacheStore } from '@/stores/cacheStore'

// Utilities
import { addOrdinalSuffix } from '../utils/suffix'
import { getCellStyle } from '../utils/dynamicColorTable'
import { sleep } from '../utils/delay'

// Asset Imports (Logos)
import fnLogo from '@/assets/sourceLogos/fn.png'
import ktcLogo from '@/assets/sourceLogos/ktc.png'
import dpLogo from '@/assets/sourceLogos/dp.png'
import fcLogo from '@/assets/sourceLogos/fc.png'
import ddLogo from '@/assets/sourceLogos/dd.svg'

// --- Constants ---
const API_URL = import.meta.env.VITE_API_URL
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE // For Ant Design Empty component

// --- Router and Cache Store Initialization ---
const route = useRoute()
const router = useRouter()
const cacheStore = useCacheStore()

// --- Component State ---

// UI State
const activeKey = ref('1') // Active tab key
const showProjections = ref(false) // Toggle between overall and projection views
const showTabInfoModal = ref(false) // Visibility for the league view guide modal
const isPlayerModalVisible = ref(false) // Visibility for the player detail modal
const expandedMobileManagers = ref({}) // Tracks expanded managers in mobile view
const expandedMobileManagerPosition = ref({}) // Tracks expanded positions within a mobile manager card
const expandedTeams = reactive({}) // Tracks expanded teams in Team Composition tab
const isLoading = ref(false) // General loading state for initial roster load
const summaryIsLoading = ref(false) // Loading state for summary data
const detailIsLoading = ref(false) // Loading state for detail data
const isProjectionLoading = ref(false) // Loading state for projection data
const baIsLoading = ref(false) // Loading state for best available data
// const isTradesLoading = ref(false); // Trades loading state (currently not used to control a spinner)
const clickedManager = ref('') // Tracks clicked manager for highlighting in Position Groups/League Assets

// Data Filters & Selected Options
const overallFilter = ref('all') // Player filter: 'all' or 'STARTER'
const value1 = ref('espn') // Selected projection source (e.g., 'espn', 'cbs')
const selectedPlayer = ref(null) // Holds data for the player modal
const selectedUser = ref(null) // Holds data for the selected manager in certain tabs
// const selectedUserId = ref(null); // Tracks selected user ID (seems redundant if selectedUser is used)

// League Information (from route params)
const leagueInfo = reactive({
  leagueName: route.params.leagueName as string,
  leagueId: route.params.leagueId as string,
  userName: route.params.userName as string,
  leagueYear: route.params.leagueYear as string,
  guid: route.params.guid as string,
  rankType: route.params.rankType as string,
  platform: route.params.platform as string,
  userId: route.params.userId as string,
  rosterType: route.params.rosterType as string,
  avatar: route.params.avatar as string,
  leagueType: route.params.leagueType as string,
  apiSource: route.params.platform as string // Initial API source for rankings
  // These seem to be for navigation to league summary, ensure they are correctly typed if used elsewhere
  // leagueStarters: route.params.leagueStarters as string,
  // leagueSize: route.params.leagueSize as string,
})

// Data Holders
const summaryData = ref<any[]>([])
const detailData = ref<any[]>([{}])
const projDetailData = ref<any[]>([{}])
const projSummaryData = ref<any[]>([{}])
const tradesDetailData = ref<any[]>([{}])
const tradesSummaryData = ref<any[]>([{}])
const bestAvailableData = ref<any[]>([{}])

// Chart Data
const bchartData = ref<any[]>([])
const scatterPlotData = ref<any[]>([]) // Note: This was previously scatterPlotData, check if OverallScatterPlotData is the intended one
const projectionBarChartData = ref<any[]>([])
const projectionPercentColumnData = ref<any[]>([])

// --- Computed Properties ---

// URL for navigating back to leagues list
const leaguesUrl = computed(
  () => `/leagues/${leagueInfo.leagueYear}/${leagueInfo.userName}/${leagueInfo.guid}`
)

// Filtered player data based on 'overallFilter' (All Players vs. Starters)
const filteredData = computed(() => {
  if (overallFilter.value === 'all') {
    return detailData.value
  }
  return detailData.value.filter((item) => item.fantasy_designation === overallFilter.value)
})

// Filtered projection player data
const filteredProjData = computed(() => {
  if (overallFilter.value === 'all') {
    return projDetailData.value
  }
  return projDetailData.value.filter((item) => item.fantasy_designation === overallFilter.value)
})

// Dynamic percentile thresholds for identifying high/low value assets
const overallValueThresholds = computed(() => calculatePercentileThresholds(detailData.value, 85))
const projectionValueThresholds = computed(() =>
  calculatePercentileThresholds(projDetailData.value, 85)
)
const overallLowValueThresholds = computed(() =>
  calculatePercentileThresholds(detailData.value, 15)
)
const projectionLowValueThresholds = computed(() =>
  calculatePercentileThresholds(projDetailData.value, 15)
)

// Data for Overall Scatter Plot (Team Tiers)
const OverallScatterPlotData = computed(() => {
  const valueField = overallFilter.value === 'all' ? 'total_value' : 'starters_sum'
  return summaryData.value
    .map((summaryItem) => {
      const projectionItem = projSummaryData.value.find(
        (projItem) => projItem.user_id === summaryItem.user_id
      )
      return projectionItem
        ? {
            Manager: summaryItem.display_name,
            Value: summaryItem[valueField],
            Projection: projectionItem[valueField]
          }
        : null
    })
    .filter((item) => item !== null)
})

// Sorted summary data for manager lists, respects showProjections and overallFilter
const sortedSummaryData = computed(() => {
  if (showProjections.value && projSummaryData.value.length > 0) {
    // Sort by projection ranks
    return [...projSummaryData.value].sort((a, b) =>
      overallFilter.value === 'all'
        ? a.total_rank - b.total_rank
        : a.starters_rank - b.starters_rank
    )
  }
  if (summaryData.value.length > 0) {
    // Sort by overall ranks
    return [...summaryData.value].sort((a, b) =>
      overallFilter.value === 'all'
        ? a.total_rank - b.total_rank
        : a.starters_rank - b.starters_rank
    )
  }
  return []
})

// Available ranking sources
const sources = [
  { key: 'sf', name: 'FantasyNavigator', logo: fnLogo },
  { key: 'ktc', name: 'KeepTradeCut', logo: ktcLogo },
  { key: 'dp', name: 'DynastyProcess', logo: dpLogo },
  { key: 'fc', name: 'FantasyCalc', logo: fcLogo },
  { key: 'dd', name: 'DynastyDaddy', logo: ddLogo }
]
const selectedSource = ref(sources.find((s) => s.key === leagueInfo.platform) || sources[0])

// Filtered sources based on league type (Dynasty vs. Redraft)
const filteredSources = computed(() => {
  if (leagueInfo.rankType !== 'Dynasty') {
    return sources.filter((s) => ['fc', 'ktc', 'sf'].includes(s.key))
  }
  return sources
})

// Helper function to generate common table columns for positions
const createPositionColumnsConfig = (filterValue: string) => {
  const positions = ['QB', 'RB', 'WR', 'TE']
  return positions.map((position) => {
    const dataKey =
      filterValue === 'all'
        ? `${position.toLowerCase()}_rank`
        : `${position.toLowerCase()}_starter_rank`
    return {
      title: position,
      dataIndex: dataKey,
      key: `${position.toLowerCase()}_rank`, // Key can be consistent
      align: 'center',
      customRender: ({ record }) => `${addOrdinalSuffix(record[dataKey])}`,
      sorter: (a, b) => a[dataKey] - b[dataKey],
      customCell: (record) => ({ style: getCellStyle(record[dataKey]) })
    }
  })
}

// Columns for the main data table (Overall/Rankings)
const columns = computed(() => {
  const base = [
    { title: '', dataIndex: 'display_name', key: 'display_name', align: 'left', width: 1 },
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
    ...createPositionColumnsConfig(overallFilter.value)
  ]
  if (overallFilter.value === 'all') {
    base.push(
      {
        title: 'Picks',
        dataIndex: 'picks_rank',
        key: 'picks_rank',
        align: 'center',
        customRender: ({ record }) => `${addOrdinalSuffix(record.picks_rank)}`,
        sorter: (a, b) => a.picks_rank - b.picks_rank,
        customCell: (record) => ({ style: getCellStyle(record.picks_rank) })
      },
      {
        title: 'Bench',
        dataIndex: 'bench_rank',
        key: 'bench_rank',
        align: 'center',
        customRender: ({ record }) => `${addOrdinalSuffix(record.bench_rank)}`,
        sorter: (a, b) => a.bench_rank - b.bench_rank,
        customCell: (record) => ({ style: getCellStyle(record.bench_rank) })
      }
    )
  }
  return base
})

// Columns for the projection data table
const projColumns = computed(() => [
  { title: '', dataIndex: 'display_name', key: 'display_name', align: 'left', width: 1 },
  {
    title: overallFilter.value === 'all' ? 'Overall' : 'Starters',
    dataIndex: overallFilter.value === 'all' ? 'total_rank' : 'starters_rank',
    key: 'overall_rank_proj', // Different key for projections
    align: 'center',
    customRender: ({ record }) =>
      `${addOrdinalSuffix(overallFilter.value === 'all' ? record.total_rank : record.starters_rank)}`,
    sorter: (a, b) =>
      overallFilter.value === 'all'
        ? a.total_rank - b.total_rank
        : a.starters_rank - b.starters_rank,
    customCell: (record) => ({
      style: getCellStyle(overallFilter.value === 'all' ? record.total_rank : record.starters_rank)
    })
  },
  ...createPositionColumnsConfig(overallFilter.value)
  // Projections typically don't include Picks/Bench ranks in this summary table format
])

// Player data sorted for "League Assets" tab, chunked for display
const sortedFilteredData = computed(() => {
  const players = filteredData.value.filter((a) => a.player_position !== 'PICKS')
  const picks = filteredData.value.filter((a) => a.player_position === 'PICKS')
  const sortedPlayers = [...players].sort((a, b) => b.player_value - a.player_value)
  const sortedPicks = sortPicks(picks) // Uses the detailed sortPicks function
  return [...sortedPlayers, ...sortedPicks]
})

const playerChunks = computed(() => {
  const size = 50
  return sortedFilteredData.value.reduce((acc, val, i) => {
    const idx = Math.floor(i / size)
    acc[idx] = acc[idx] || []
    acc[idx].push(val)
    return acc
  }, [] as any[][])
})

// Players grouped by position for "Position Groups" tab
const playersByPosition = computed(() => {
  const order = ['QB', 'RB', 'WR', 'TE', 'PICKS']
  const groups = {}
  order.forEach((pos) => (groups[pos] = []))

  filteredData.value.forEach((player) => {
    if (groups[player.player_position]) {
      groups[player.player_position].push(player)
    }
  })

  order.forEach((pos) => {
    if (groups[pos]) {
      if (pos === 'PICKS') {
        groups[pos] = sortPicks(groups[pos])
      } else {
        groups[pos].sort((a, b) => b.player_value - a.player_value)
      }
      if (groups[pos].length === 0) delete groups[pos]
    } else {
      delete groups[pos]
    }
  })
  return groups
})

// Grouped best available players for "Waivers" tab
const groupedPlayers = computed(() => {
  return bestAvailableData.value.reduce((acc, player) => {
    acc[player.player_position] = acc[player.player_position] || []
    acc[player.player_position].push(player)
    return acc
  }, {})
})

// --- Watchers ---

// React to changes in the overall player filter (All vs. Starters)
watch(overallFilter, () => {
  if (summaryData.value.length) {
    updateBchartData(summaryData.value)
    // updateScatterPlotData(summaryData.value); // This seems to be for a different scatter plot
  }
  if (projSummaryData.value.length) {
    // Ensure projSummaryData is used for projection charts
    updateProjectionData(projSummaryData.value)
  }
  // If a user is selected, re-evaluate based on the new filter
  if (selectedUser.value) {
    const currentDataArray = showProjections.value ? projSummaryData.value : summaryData.value
    const updatedSelectedUser = currentDataArray.find(
      (u) => u.user_id === selectedUser.value.user_id
    )
    if (updatedSelectedUser) {
      selectedUser.value = updatedSelectedUser
    }
  }
})

// --- Lifecycle Hooks ---

onMounted(() => {
  // Initial data load when component is mounted
  if (
    leagueInfo.leagueId &&
    leagueInfo.platform &&
    leagueInfo.rankType &&
    leagueInfo.guid &&
    leagueInfo.userId
  ) {
    insertLeagueDetials() // Passing no argument, will use leagueInfo from reactive state
  }
})

// --- Core Logic & Data Fetching ---

/**
 * Sorts an array of draft pick objects.
 * Picks are sorted primarily by year, then by round number, then by tier (Early, Mid, Late),
 * then by specific pick number (e.g., 1.05), and finally by player_value descending as a fallback.
 * @param {Array} picks - Array of pick objects, each expected to have 'full_name' and 'player_value'.
 * @returns {Array} - A new array with sorted picks.
 */
// --- START: Added Pick Sorting Logic ---
// ...existing code...
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

/**
 * Calculates percentile thresholds for player values by position.
 * @param {Array} data - Array of player objects.
 * @param {number} percentile - The percentile to calculate (e.g., 85 for 85th percentile).
 * @returns {Object} - An object with positions as keys and threshold values.
 */
// --- START: Dynamic Percentile Threshold Calculation ---
// ...existing code...
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
// --- END: Dynamic Percentile Threshold Calculation ---

/**
 * Orchestrates the initial league data loading process.
 * Clears relevant cache, posts roster data, then fetches all necessary league details.
 * The 'values' parameter (leagueId) is optional; if not provided, uses leagueInfo.leagueId.
 */
const insertLeagueDetials = async (leagueIdParam?: string) => {
  const currentLeagueId = leagueIdParam || leagueInfo.leagueId
  // Clear specific cache entries for this league to ensure fresh data
  Object.keys(cacheStore.cache).forEach((key) => {
    if (key.includes(currentLeagueId.toString())) {
      cacheStore.remove(key)
    }
  })

  isLoading.value = true
  detailIsLoading.value = true
  summaryIsLoading.value = true
  console.log('Attempting to insert/update rosters for league:', currentLeagueId)

  const cacheBuster = Date.now().toString() // Generate cache buster timestamp

  try {
    await axios.post(`${API_URL}/roster`, {
      league_id: currentLeagueId,
      user_id: leagueInfo.userId,
      guid: leagueInfo.guid,
      league_year: leagueInfo.leagueYear
    })
    console.log('Rosters loading initiated...')
  } catch (error) {
    console.error('Error posting roster data:', error)
    message.error('Failed to update rosters. Data shown might be outdated.')
  } finally {
    isLoading.value = false // Update loading state

    // Fetch all data components, passing the cacheBuster
    // Use leagueInfo for consistent parameters from the reactive state
    fetchSummaryData(
      leagueInfo.leagueId,
      leagueInfo.apiSource,
      leagueInfo.rankType,
      leagueInfo.guid,
      leagueInfo.rosterType,
      leagueInfo.leagueType,
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
    fetchProjectionData(leagueInfo.leagueId, value1.value, leagueInfo.guid, cacheBuster) // value1 is the projection source (e.g. 'espn')
  }
}

/**
 * Fetches projection data (summary and detail) for the league.
 * Includes retry logic and uses a cache buster if provided.
 */
async function fetchProjectionData(
  leagueId: string,
  projectionSource: string,
  guid: string,
  cacheBuster?: string
) {
  isProjectionLoading.value = true // Set loading state for projections specifically
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 2000 // ms

  const params: any = { league_id: leagueId, projection_source: projectionSource, guid: guid }
  if (cacheBuster) params._cb = cacheBuster

  while (retryCount < maxRetries) {
    try {
      console.log(`Fetching projection data (Attempt ${retryCount + 1})...`)
      const [summaryResponse, detailResponse] = await Promise.all([
        axios.get(`${API_URL}/contender_league_summary`, { params }),
        axios.get(`${API_URL}/contender_league_detail`, { params })
      ])

      projDetailData.value = detailResponse.data
      projSummaryData.value = summaryResponse.data.map((item) => ({
        ...item,
        total_rank_display: addOrdinalSuffix(item.total_rank),
        starters_rank_display: addOrdinalSuffix(item.starters_rank),
        qb_rank_display: addOrdinalSuffix(item.qb_rank),
        rb_rank_display: addOrdinalSuffix(item.rb_rank),
        wr_rank_display: addOrdinalSuffix(item.wr_rank),
        te_rank_display: addOrdinalSuffix(item.te_rank)
      }))

      updateProjectionData(summaryResponse.data) // Update chart data
      projectionPercentColumnData.value = summaryResponse.data.map((item) => ({
        display_name: item.display_name,
        starters_sum: item.starters_sum,
        bench_sum: item.bench_sum
      }))

      console.log('Projection data fetched successfully.')
      isProjectionLoading.value = false
      return
    } catch (error) {
      console.error('Error fetching projection data:', error)
      retryCount++
      if (retryCount < maxRetries) {
        await sleep(retryDelay)
      }
    }
  }
  console.error('Failed to fetch projection data after retries.')
  message.error('Failed to fetch projection data. Please try again later.')
  isProjectionLoading.value = false
}

/**
 * Fetches summary league data.
 * Uses caching and retry logic. A cache buster bypasses the cache.
 */
async function fetchSummaryData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string,
  leagueType: string,
  cacheBuster?: string
) {
  summaryIsLoading.value = true
  const cacheKey = `summary_${leagueId}_${platform}_${rankType}_${guid}_${rosterType}_${leagueType}`

  if (!cacheBuster && cacheStore.has(cacheKey)) {
    const cachedData = cacheStore.get(cacheKey)
    summaryData.value = cachedData
    updateBchartData(cachedData)
    // updateScatterPlotData(cachedData); // Check if this is the correct scatter plot data to update
    summaryIsLoading.value = false
    console.log('Using cached summary data.')
    return
  }

  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500
  const params: any = {
    league_id: leagueId,
    platform,
    rank_type: rankType,
    guid,
    roster_type: rosterType,
    league_type: leagueType
  }
  if (cacheBuster) params._cb = cacheBuster

  try {
    while (retryCount < maxRetries) {
      try {
        const response = await axios.get(`${API_URL}/league_summary`, { params })
        const rawData = response.data
        const processedData = rawData.map((item) => ({
          ...item,
          total_rank_display: addOrdinalSuffix(item.total_rank),
          // ... other mappings ...
          picks_percent: item.total_value ? (item.picks_sum / item.total_value) * 100 : 0
        }))
        cacheStore.set(cacheKey, processedData)
        summaryData.value = processedData
        updateBchartData(rawData) // Use rawData for charts if they expect original structure
        // updateScatterPlotData(rawData);
        console.log('League summary data fetched successfully.')
        break // Exit loop on success
      } catch (error) {
        console.error(`Error fetching league summary (Attempt ${retryCount + 1}):`, error.message)
        retryCount++
        if (retryCount < maxRetries) await sleep(retryDelay)
        else throw error // Re-throw after max retries
      }
    }
  } catch (error) {
    console.error('Failed to fetch league summary data after retries.')
    message.error('Failed to load league summary. Please try again.')
  } finally {
    summaryIsLoading.value = false
    // Post user's rank summary (fire and forget)
    const userSummary = summaryData.value.find((item) => item.user_id === leagueInfo.userId)
    if (userSummary) {
      try {
        axios.post(`${API_URL}/ranks_summary`, {
          user_id: leagueInfo.userId,
          display_name: leagueInfo.userName,
          league_id: leagueInfo.leagueId,
          rank_source: platform,
          power_rank: userSummary.total_rank,
          starters_rank: userSummary.starters_rank,
          bench_rank: userSummary.bench_rank,
          picks_rank: userSummary.picks_rank
        })
      } catch (e) {
        console.error('Error posting ranks summary:', e.message)
      }
    }
  }
}

/**
 * Fetches detailed league data (individual player assets).
 * Uses caching and retry logic.
 */
async function fetchDetailData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string,
  cacheBuster?: string
) {
  detailIsLoading.value = true
  const cacheKey = `detail_${leagueId}_${platform}_${rankType}_${guid}_${rosterType}`

  if (!cacheBuster && cacheStore.has(cacheKey)) {
    detailData.value = cacheStore.get(cacheKey)
    detailIsLoading.value = false
    console.log('Using cached detail data.')
    return
  }

  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500
  const params: any = {
    league_id: leagueId,
    platform,
    rank_type: rankType,
    guid,
    roster_type: rosterType
  }
  if (cacheBuster) params._cb = cacheBuster

  try {
    while (retryCount < maxRetries) {
      try {
        const response = await axios.get(`${API_URL}/league_detail`, { params })
        cacheStore.set(cacheKey, response.data)
        detailData.value = response.data
        console.log('League detail data fetched successfully.')
        break // Exit loop
      } catch (error) {
        console.error(`Error fetching league detail (Attempt ${retryCount + 1}):`, error.message)
        retryCount++
        if (retryCount < maxRetries) await sleep(retryDelay)
        else throw error
      }
    }
  } catch (error) {
    console.error('Failed to fetch league detail data after retries.')
    message.error('Failed to load league asset details. Please try again.')
  } finally {
    detailIsLoading.value = false
  }
}

/**
 * Fetches best available players (waivers).
 * Uses caching and retry logic.
 */
async function fetchBaData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string,
  cacheBuster?: string
) {
  baIsLoading.value = true
  const cacheKey = `ba_${leagueId}_${platform}_${rankType}_${guid}_${rosterType}`

  if (!cacheBuster && cacheStore.has(cacheKey)) {
    bestAvailableData.value = cacheStore.get(cacheKey)
    baIsLoading.value = false
    console.log('Using cached best available data.')
    return
  }

  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500
  const params: any = {
    league_id: leagueId,
    platform,
    rank_type: rankType,
    guid,
    roster_type: rosterType
  }
  if (cacheBuster) params._cb = cacheBuster

  try {
    while (retryCount < maxRetries) {
      try {
        const response = await axios.get(`${API_URL}/best_available`, { params })
        cacheStore.set(cacheKey, response.data)
        bestAvailableData.value = response.data
        console.log('Best available data fetched successfully.')
        break // Exit loop
      } catch (error) {
        console.error(`Error fetching best available (Attempt ${retryCount + 1}):`, error.message)
        retryCount++
        if (retryCount < maxRetries) await sleep(retryDelay)
        else throw error
      }
    }
  } catch (error) {
    console.error('Failed to fetch best available data after retries.')
    message.error('Failed to load best available players. Please try again.')
  } finally {
    baIsLoading.value = false
  }
}

/**
 * Fetches trades data (summary and detail).
 * Includes retry logic. Cache buster can be used.
 */
async function fetchTrades(
  leagueId: string,
  platformApi: string,
  rosterType: string,
  leagueYear: string,
  rankType: string,
  cacheBuster?: string
) {
  // isTradesLoading.value = true; // Consider adding a loading state if UI feedback is needed
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500
  const params: any = {
    league_id: leagueId,
    platform: platformApi,
    roster_type: rosterType,
    league_year: leagueYear,
    rank_type: rankType
  }
  if (cacheBuster) params._cb = cacheBuster

  try {
    while (retryCount < maxRetries) {
      try {
        console.log(`Fetching trades data (Attempt ${retryCount + 1})...`)
        const [summaryResponse, detailResponse] = await Promise.all([
          axios.get(`${API_URL}/trades_summary`, { params }),
          axios.get(`${API_URL}/trades_detail`, { params })
        ])
        tradesSummaryData.value = summaryResponse.data
        tradesDetailData.value = detailResponse.data
        console.log('Trade data fetched successfully.')
        // isTradesLoading.value = false;
        return // Exit function
      } catch (error) {
        console.error('Error fetching trades data:', error)
        retryCount++
        if (retryCount < maxRetries) await sleep(retryDelay)
        else throw error // Re-throw after max retries
      }
    }
  } catch (error) {
    console.error('Failed to fetch trade data after retries.')
    message.error('Failed to load trade data. Please try again.')
    // isTradesLoading.value = false;
  }
}

// --- Event Handlers ---

/**
 * Handles selection of a new ranking source from the dropdown.
 * Fetches new summary, detail, BA, and trades data for the selected source.
 */
const handleMenuClick: MenuProps['onClick'] = (e) => {
  const newPlatform = e.key as string
  selectedSource.value = sources.find((s) => s.key === newPlatform) || sources[0]
  leagueInfo.apiSource = newPlatform // Update current API source

  // Clear cache for the new platform to ensure fresh data if not using cache buster logic here
  // Or rely on insertLeagueDetials to handle cache busting if it's called.
  // For simplicity, directly call fetch methods with the new platform.
  // A full cache invalidation and re-fetch via insertLeagueDetials might be more robust
  // if changing source implies a full data refresh.
  // However, current insertLeagueDetials is tied to initial load/refresh button.
  // So, direct calls here:
  const cacheBuster = Date.now().toString() // Force refresh for new source
  fetchSummaryData(
    leagueInfo.leagueId,
    newPlatform,
    leagueInfo.rankType,
    leagueInfo.guid,
    leagueInfo.rosterType,
    leagueInfo.leagueType,
    cacheBuster
  )
  fetchDetailData(
    leagueInfo.leagueId,
    newPlatform,
    leagueInfo.rankType,
    leagueInfo.guid,
    leagueInfo.rosterType,
    cacheBuster
  )
  fetchBaData(
    leagueInfo.leagueId,
    newPlatform,
    leagueInfo.rankType,
    leagueInfo.guid,
    leagueInfo.rosterType,
    cacheBuster
  )
  fetchTrades(
    leagueInfo.leagueId,
    newPlatform,
    leagueInfo.rosterType,
    leagueInfo.leagueYear,
    leagueInfo.rankType,
    cacheBuster
  )

  message.success(`Ranking source changed to ${selectedSource.value.name}`)
}

/**
 * Handles change in projection source selection.
 * Fetches new projection data.
 */
const handleProjChange = async (projectionSource: string) => {
  fetchProjectionData(leagueInfo.leagueId, projectionSource, leagueInfo.guid, Date.now().toString())
}

/**
 * Handles toggling between Overall and Projections view.
 * Fetches projection data if not already loaded. Updates selected user if any.
 */
const handleViewToggle = (checked: boolean) => {
  showProjections.value = checked // Explicitly set, though v-model does this
  if (checked) {
    // Switched to Projections
    if (projSummaryData.value.length === 0 || projDetailData.value.length === 0) {
      fetchProjectionData(leagueInfo.leagueId, value1.value, leagueInfo.guid, Date.now().toString())
    }
    if (selectedUser.value) {
      const projUser = projSummaryData.value.find((p) => p.user_id === selectedUser.value.user_id)
      if (projUser) selectedUser.value = projUser
    }
  } else {
    // Switched to Overall
    if (selectedUser.value) {
      const overallUser = summaryData.value.find((s) => s.user_id === selectedUser.value.user_id)
      if (overallUser) selectedUser.value = overallUser
    }
  }
}

/**
 * Handles clicking on a user/manager.
 * Toggles selection or sets the clicked user as selected.
 */
function handleUserClick(user: any) {
  clickedManager.value = clickedManager.value === user.display_name ? '' : user.display_name
  if (selectedUser.value && selectedUser.value.user_id === user.user_id) {
    selectedUser.value = null // Deselect if already selected
  } else {
    selectedUser.value = user // Select the new user
  }
}

/**
 * Navigates to the league summary page.
 */
const getLeagueSummary = async () => {
  try {
    // Ensure all params for league summary route are available and correctly encoded
    const {
      userName,
      userId,
      leagueId,
      leagueName,
      leagueYear,
      rosterType,
      guid,
      avatar,
      rankType
    } = leagueInfo
    // const leagueStarters = route.params.leagueStarters as string; // Or from leagueInfo if stored
    // const leagueSize = route.params.leagueSize as string; // Or from leagueInfo if stored

    // Example: If leagueStarters and leagueSize are not in leagueInfo, fetch from route or define defaults
    const leagueStarters = route.params.leagueStarters || '0'
    const leagueSize = route.params.leagueSize || '0'

    const url = `/leaguesummary/${encodeURIComponent(userName)}/${encodeURIComponent(userId)}/${encodeURIComponent(leagueId)}/${encodeURIComponent(leagueName)}/${encodeURIComponent(leagueYear)}/${encodeURIComponent(leagueStarters.toString())}/${encodeURIComponent(leagueSize.toString())}/${encodeURIComponent(rosterType)}/${encodeURIComponent(guid)}/${encodeURIComponent(rosterType)}/${encodeURIComponent(avatar)}/${encodeURIComponent(rankType)}`
    router.push(url)
  } catch (error) {
    console.error('Failed to navigate to league summary:', error)
    message.error('Could not open league summary.')
  }
}

// Player Modal Handlers
const showPlayerModal = (player: any) => {
  selectedPlayer.value = player
  isPlayerModalVisible.value = true
}
const handlePlayerModalOk = () => {
  isPlayerModalVisible.value = false
}

// Expand/Collapse Handlers for UI elements
function toggleExpand(userId: string) {
  expandedTeams[userId] = !expandedTeams[userId]
}
const toggleMobileManagerExpand = (userId: string) => {
  expandedMobileManagers.value[userId] = !expandedMobileManagers.value[userId]
  if (!expandedMobileManagers.value[userId]) {
    expandedMobileManagerPosition.value[userId] = null // Collapse position if manager is collapsed
  }
}
const toggleMobileManagerPositionExpand = (userId: string, position: string) => {
  expandedMobileManagerPosition.value[userId] =
    expandedMobileManagerPosition.value[userId] === position ? null : position
}

// --- Utility Functions & Data Transformations ---

// Chart data update functions
const updateBchartData = (rawData: any[]) => {
  bchartData.value = rawData.flatMap((item) => {
    const displayName =
      item.display_name.length > 8 ? `${item.display_name.slice(0, 8)}...` : item.display_name
    const positions = ['qb', 'rb', 'wr', 'te']
    const data = positions.map((pos) => ({
      display_name: displayName,
      value: overallFilter.value === 'all' ? item[`${pos}_sum`] : item[`${pos}_starter_sum`],
      position: pos.toUpperCase(),
      rank: overallFilter.value === 'all' ? item[`${pos}_rank`] : item[`${pos}_starter_rank`]
    }))
    if (overallFilter.value === 'all' && item.picks_sum !== undefined) {
      // Check if picks_sum exists
      data.push({
        display_name: displayName,
        value: item.picks_sum,
        position: 'Picks',
        rank: item.picks_rank
      })
    }
    return data
  })
}

const updateProjectionData = (rawData: any[]) => {
  projectionBarChartData.value = rawData.flatMap((item) => {
    const displayName =
      item.display_name.length > 8 ? `${item.display_name.slice(0, 8)}...` : item.display_name
    const positions = ['qb', 'rb', 'wr', 'te'] // Projections usually don't include picks in this chart
    return positions.map((pos) => ({
      display_name: displayName,
      value: overallFilter.value === 'all' ? item[`${pos}_sum`] : item[`${pos}_starter_sum`],
      position: pos.toUpperCase(),
      rank: overallFilter.value === 'all' ? item[`${pos}_rank`] : item[`${pos}_starter_rank`]
    }))
  })
}

// Get rank string (e.g., "1st") for a user based on current view (overall/projection) and filter
function getRank(user: any): string {
  let rankValue
  if (showProjections.value) {
    const projUser = projSummaryData.value.find((p) => p.user_id === user.user_id)
    if (projUser) {
      rankValue = overallFilter.value === 'all' ? projUser.total_rank : projUser.starters_rank
    }
  } else {
    rankValue = overallFilter.value === 'all' ? user.total_rank : user.starters_rank
  }
  return rankValue !== undefined ? addOrdinalSuffix(rankValue) : '--'
}

// Get players for a user, sorted (players by value, then picks by custom logic)
const getPlayers = (userId: string) => {
  const userAssets = filteredData.value.filter((item) => item.user_id === userId)
  const players = userAssets.filter((a) => a.player_position !== 'PICKS')
  const picks = userAssets.filter((a) => a.player_position === 'PICKS')
  return [...[...players].sort((a, b) => b.player_value - a.player_value), ...sortPicks(picks)]
}

const getPlayersProj = (userId: string) => {
  const userAssets = filteredProjData.value.filter((item) => item.user_id === userId)
  const players = userAssets.filter((a) => a.player_position !== 'PICKS')
  const picks = userAssets.filter((a) => a.player_position === 'PICKS') // Proj data might not have picks
  return [
    ...[...players].sort((a, b) => b.player_value - a.player_value),
    ...(picks.length > 0 ? sortPicks(picks) : []) // Handle if no picks in proj data
  ]
}

// Get players for a specific position for mobile view, respecting filters and projection view
const getPlayersForMobilePosition = (userId: string, position: string) => {
  const allPlayersForUser = showProjections.value ? getPlayersProj(userId) : getPlayers(userId)
  return allPlayersForUser.filter((p) => p.player_position === position)
}

// Styling utility for position tags
function getPositionTagList(position: string, opacity = 0.6) {
  const colors = {
    QB: 'rgb(39, 125, 161',
    RB: 'rgb(144, 190, 109',
    WR: 'rgb(67, 170, 139',
    TE: 'rgb(249, 132, 74',
    PICKS: 'rgb(70, 70, 70'
  }
  const color = colors[position] || 'rgb(0,0,0)' // Default color
  return {
    background: `${color}, ${opacity})`,
    'border-color': color,
    border: `1px solid ${color}, ${opacity + 0.2})` // Slightly more opaque border
  }
}

// Titles for position groups
const positionTitles = {
  QB: 'Quarterbacks',
  RB: 'Running Backs',
  WR: 'Wide Receivers',
  TE: 'Tight Ends',
  PICKS: 'Draft Picks'
}
</script>

<style scoped>
/* General Layout */
.layout {
  min-height: 100vh;
}
.responsive-padding {
  padding: 0 10px;
}
@media (min-width: 440px) {
  .responsive-padding {
    padding: 0 100px; /* Consider using variables or more granular steps */
  }
}
.text-center-margin-top-30 {
  /* For h2 heatmap title */
  text-align: center;
  margin-top: 30px;
}
.font-bold {
  font-weight: bold;
}
.margin-right-8 {
  margin-right: 8px;
}
.font-size-1-1em {
  font-size: 1.1em;
}
.font-size-18 {
  font-size: 18px;
}
.font-bolder {
  font-weight: bolder;
}
.justify-center-row {
  justify-content: center;
}
.position-group-col {
  min-width: 220px;
}
.avatar-bordered {
  border: 2px solid rgb(39, 125, 161);
}
.player-chunk-container {
  border: 1px solid lightgray;
  border-radius: 5px;
  margin: 5px;
  padding: 5px;
}
.no-padding-ul {
  padding: 0;
}
.player-chunk-item {
  border-radius: 2px;
  margin: 2px;
}
.no-list-style {
  list-style: none;
}
.waiver-player-item {
  margin-bottom: 2px;
  border-radius: 2px;
}
.team-card-column {
  min-width: 300px;
  max-width: 315px;
}
.heatmap-table-container {
  width: 100%;
  max-width: 1150px;
}
.full-width-table {
  width: 100%;
}

/* League Header & Info */
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
  /* text-align: center; Removed as justify-content: left is used */
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

/* Data Controls Card */
/* ... existing .data-controls-card styles ... */
.data-controls-card {
  margin-bottom: 24px;
  background-color: var(--background-color-secondary, #f9f9f9);
  border: 1px solid var(--border-color, #e8e8e8);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.data-controls-card .ant-card-body {
  padding: 20px 24px !important;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
}

.control-label {
  font-weight: 500;
  font-size: 13px;
  color: var(--text-color-secondary, #555);
  margin-bottom: 0;
  line-height: 1.4;
}

.ant-switch {
  transform: scale(1);
  margin: 0;
}

.ant-radio-group {
  display: inline-flex;
}

.ant-select,
.ant-dropdown-button .ant-btn {
  min-width: 120px;
}

@media (max-width: 1199px) {
  .control-group {
    align-items: center;
    margin-bottom: 16px;
  }
  .control-group:last-child {
    margin-bottom: 0;
  }
  .ant-radio-group,
  .ant-select,
  .ant-dropdown-button {
    width: auto;
    max-width: 250px;
  }
}

@media (min-width: 1200px) {
  .control-group {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
  }
  .control-label {
    min-width: 110px;
    text-align: right;
    margin-right: 4px;
  }
}

/* Tabs & Tab Content */
.tab-header-container {
  position: relative;
}
.tab-sub-header {
  text-align: left;
  margin-bottom: 25px;
}
.info-button {
  /* For tab guide */
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

/* Managers Grid (used in multiple tabs) */
/* ... existing .managers-card, .managers-grid, .manager-item styles ... */
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
  background-color: rgba(25, 118, 210, 0.8); /* Updated QB color */
}
.rb-badge {
  background-color: rgba(144, 190, 109, 0.8);
}
.wr-badge {
  background-color: rgba(76, 175, 80, 0.8); /* Updated WR color */
}
.te-badge {
  background-color: rgba(249, 132, 74, 0.8);
}

/* Charts & Visualizations */
/* ... existing .modern-card, .card-header, .viz-container, .chart-title styles ... */
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
  border: none; /* Was: border: 1px solid #d3d3d3; */
  padding: 10px;
  margin: 0; /* Was: margin: 10px 0; */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chart-title {
  font-size: 16px; /* Was implicitly styled, making it explicit */
  font-weight: 600;
  color: var(--text-color, #333);
  /* text-align: center; Already in .card-header */
  /* margin-bottom: 20px; Already in .card-header */
}

/* Heatmap Table (Desktop & Mobile) */
/* ... existing .table-section, .highlighted-row styles ... */
/* ... existing .expanded-row-content and its children (.position-summary, .players-grid, .player-card) styles ... */
/* ... existing .high-value-asset, .low-value-asset, .mid-value-asset styles ... */
/* ... existing .heatmap-mobile-view and its children styles ... */
.table-section {
  display: flex;
  justify-content: center;
}
.ant-table-tbody > tr {
  border-bottom: 1px solid white; /* Assuming dark theme context, adjust if needed */
}
.ant-table-tbody > tr > td {
  color: white; /* Assuming dark theme context */
}
.ant-table-thead > tr > th {
  color: white; /* Assuming dark theme context */
  border-bottom: 2px solid white; /* Assuming dark theme context */
}
.highlighted-row td,
.manager-card-mobile.highlighted-row {
  font-weight: 600; /* Ensure mobile highlight also gets font weight */
}
.expanded-row-content {
  padding: 12px 8px;
  background-color: #fafafa; /* Light background for expanded details */
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
  max-width: 340px; /* Max width for readability */
}
/* ... other position-summary-item children styles ... */
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
} /* Ant tag default margins might be fine */

.position-stats {
  display: grid;
  grid-template-columns: auto 1fr; /* Label and value */
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
} /* Emphasize value */

/* Position-specific border colors */
.position-qb {
  border-left: 3px solid rgb(25, 118, 210); /* Updated QB color */
}
.position-rb {
  border-left: 3px solid rgb(144, 190, 109);
}
.position-wr {
  border-left: 3px solid rgb(76, 175, 80); /* Updated WR color */
}
.position-te {
  border-left: 3px solid rgb(249, 132, 74);
}
.position-picks {
  border-left: 3px solid rgb(143, 145, 146);
}

.players-grid {
  display: flex;
  flex-wrap: wrap; /* Allow columns to wrap on smaller screens */
  gap: 16px;
}

.position-players-column {
  flex: 1; /* Each column takes equal space */
  min-width: 165px; /* Minimum width before wrapping */
  max-width: 340px;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 4px; /* Space between player cards */
}

.player-card {
  padding: 6px 8px;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.player-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
/* ... other player-card children styles ... */
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

/* Asset value indicators */
.high-value-asset,
.low-value-asset,
.mid-value-asset {
  padding-left: 12px;
}
.high-value-asset::before,
.low-value-asset::before,
.mid-value-asset::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.high-value-asset::before {
  background-color: gold;
}
.low-value-asset::before {
  background-color: #e74c3c;
} /* Was: #e74d3cdd */
.mid-value-asset::before {
  background-color: #bdbdbd;
}

/* Mobile Heatmap Specifics */
.heatmap-mobile-view {
  display: none;
} /* Hidden by default, shown via media query */
.manager-card-mobile {
  background-color: var(--card-background-color, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease-in-out;
}
.manager-card-mobile:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.manager-info-line-mobile {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.manager-name-mobile {
  /* font-weight: 900; font-size: 1.25em; */
  color: var(--text-color, #333);
} /* Simplified */
.manager-stats-grid-mobile {
  /* Ant Row used, gutter handles spacing */
}
.manager-card-mobile-details-reused {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.position-summary-item.active-position-summary {
  background-color: rgba(24, 144, 255, 0.08); /* Highlight for active mobile position */
}
.nested-players-container {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
}
.nested-players-container .players-list {
  gap: 6px;
}
.nested-players-container .player-card {
  background-color: var(--background-color-secondary, #f9f9f9);
}
.no-players-notice {
  padding: 10px 8px;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.9em;
  background-color: var(--background-color-tertiary, #f5f5f5);
  border-radius: 4px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  /* Breakpoint for mobile heatmap */
  .heatmap-desktop-view {
    display: none;
  }
  .heatmap-mobile-view {
    display: block;
  }
  /* Further mobile-specific adjustments from original file */
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
}
@media (max-width: 480px) {
  /* Extra small screens */
  .expanded-row-content {
    padding: 8px 4px;
  }
  .player-card {
    border-radius: 6px;
    margin-bottom: 8px;
  }
  .player-name-team {
    width: 65%;
  } /* Ensure it doesn't overflow too much */
  .player-name {
    white-space: normal;
    line-height: 1.2;
  } /* Allow name to wrap */
  .position-summary-item {
    padding: 10px;
    margin-bottom: 4px;
    width: auto;
  } /* Auto width for better fit */
  .players-grid::before {
    /* "Players" title for mobile grid */
    content: 'Players';
    display: block;
    font-weight: 600;
    margin: 8px 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid #eaeaea;
    color: #555;
  }
  .position-players-column::before {
    /* Position title for mobile column */
    content: attr(data-position);
    display: block;
    font-weight: 600;
    margin: 12px 0 8px;
    color: #444;
    font-size: 15px;
  }
}

/* Team Composition Tab (Team Cards) */
/* ... existing .team-card and its children styles ... */
.team-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 10px 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 10px 12px 8px 12px;
  display: flex;
  flex-direction: column;
  min-height: 180px; /* Ensure cards have a minimum height */
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
/* .manager-name is already defined */
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
  max-height: 340px; /* Initial collapsed height */
  overflow: hidden;
}
.team-assets-list.expanded {
  max-height: 400px; /* Expanded height */
  overflow-y: auto;
  padding-right: 5px; /* For scrollbar */
}
.team-asset-item {
  display: flex;
  align-items: center;
  border-radius: 2px;
  margin: 2px 0;
  padding: 2px 0 2px 4px;
  font-size: 13px;
  gap: 4px;
  cursor: pointer;
}
.asset-index {
  /* Style for asset number */
}
.asset-name {
  /* Style for asset name */
}
.asset-team {
  /* Style for asset team */
}
/* .player-value is already defined */
.expand-toggle {
  text-align: center;
  margin-top: 4px.;
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

/* Position Groups Tab */
/* ... existing .mirrored-user, .user-card, .gutter-box, .gutter-box-stats styles ... */
/* ... existing .position-group-container and its children styles ... */
.mirrored-user {
  max-width: 500px;
  margin: 15px 1px;
}
.user-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px 4px;
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
  /* For user name in mirrored card */
  white-space: normal;
  word-wrap: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
}
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
  max-height: 450px; /* Adjust as needed */
}
.position-player-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 5px 8px;
  border-radius: 4px;
  margin: 2px 0;
  font-size: 12px;
  cursor: pointer;
}
/* .player-name is already defined */
.player-value-display {
  font-weight: 500;
  white-space: nowrap;
  font-size: 11px;
}
.font-size-11 {
  font-size: 11px;
} /* For age in position group list */

/* League Assets Tab */
/* ... existing styles for player chunks ... */
/* .lighter and .dimmed-text are already defined */
.lighter {
  color: #aaa !important;
  opacity: 0.7;
}
.dimmed-text {
  color: #aaa !important;
}

/* Waivers Tab */
/* ... existing styles for waiver cards ... */

/* Modals (Info and Player Detail) */
/* ... existing .tab-info-container styles ... */
/* ... existing .player-modal-content and its children styles ... */
.tab-info-container h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--text-color, #1890ff); /* Use theme color */
}
.tab-info-container p {
  margin-bottom: 16px;
  line-height: 1.5;
}

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

/* Legend Styles */
.legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* Allow legend items to wrap */
  gap: 5px 10px; /* Spacing for wrapped items */
  margin: 10px 0; /* Spacing around legend */
}
.legend-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
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
.legend-qb {
  background-color: rgb(25, 118, 210); /* Updated QB color */
}
.legend-rb {
  background-color: rgb(144, 190, 109);
}
.legend-wr {
  background-color: rgb(76, 175, 80); /* Updated WR color */
}
.legend-te {
  background-color: rgb(249, 132, 74);
}
.legend-picks {
  background-color: rgba(70, 70, 70, 0.7);
}

/* Miscellaneous & Utility Styles */
.rank-logos {
  /* For source logos in dropdown */
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
}
.manager-logos {
  /* For manager avatars in team cards */
  width: 28px; /* Was 328px, assuming typo */
  height: 28px;
  vertical-align: middle;
  border-radius: 50%;
  border: 1px solid gray;
}
li {
  list-style-type: none;
} /* Global reset for li if needed, or apply more specifically */

/* Styles from original file that might be less organized or redundant, review if needed */
/* table { border-collapse: collapse; } */ /* Generally handled by Ant Design */
/* .league-info-container { ... } */ /* Seems unused */
/* .user-progress, .progress-container, .median-line, .overlay-progress, .badge-label { ... } */ /* Seem unused */
/* .avatar-traded-asset { ... } */ /* Seems unused */
/* .load-league-button { ... } */ /* Seems unused */
/* .avatar:hover { transform: scale(1.4); } */ /* Generic avatar hover, ensure it applies where intended */
/* .ant-card .ant-card-body { padding: 8px !important; } */ /* Overly broad, specific card padding is better */
/* .position-card { ... } */ /* Seems like an old or alternative card style */
/* .avatar-group-container, .progress-bar, .avatar-container, .avatar-title { ... } */ /* Seem unused */
</style>
