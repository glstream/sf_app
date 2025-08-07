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
                    <span class="control-label">Data View</span>
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
                    <span class="control-label">Player Filter</span>
                    <a-radio-group v-model:value="overallFilter" button-style="solid" size="small">
                      <a-radio-button value="all">All Players</a-radio-button>
                      <a-radio-button value="STARTER">Starters</a-radio-button>
                    </a-radio-group>
                  </div>
                </a-col>
                <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
                  <div class="control-group">
                    <span class="control-label">Projection Source</span>
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
                    <span class="control-label">Rankings Source</span>
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
                <h2 class="tab-sub-header">Power Rankings</h2>

                <!-- League Managers Grid -->
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col :span="24">
                    <a-card class="managers-card">
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
                              <span class="manager-value-label"
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
                <div class="heatmap-title-section">
                  <h2 class="heatmap-title">
                    {{ showProjections ? 'Projections' : 'Rankings' }} Heat Map
                  </h2>
                  <p class="heatmap-subtitle">
                    Interactive team rankings and performance visualization
                  </p>
                </div>

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
                                <span class="age-label">Avg Age</span>
                                <span class="age-value">{{
                                  position === 'PICKS'
                                    ? '--'
                                    : overallFilter === 'all'
                                      ? record[`${position.toLowerCase()}_average_age`]
                                      : record[`${position.toLowerCase()}_starter_average_age`]
                                }}</span>
                                <span class="value-label"></span>
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
                                <span class="value-label">{{
                                  showProjections ? 'Projections' : 'Value'
                                }}</span>
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
                                  <span class="age-label">Avg Age</span>
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
                                  <span class="age-label">Avg Age</span>
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
              <!-- Trade Calculator Tab - Only visible when rankings source is sf -->
              <a-tab-pane key="6" tab="Trade Calculator" v-if="selectedSource.key === 'sf'">
                <h2 class="tab-sub-header">Trade Calculator</h2>

                <div class="trade-calculator-container">
                  <!-- Settings Panel -->
                  <a-card class="settings-card">
                    <div class="settings-row">
                      <div class="settings-group">
                        <a-radio-group
                          v-model:value="tradeRankType"
                          button-style="solid"
                          size="middle"
                        >
                          <a-radio-button value="dynasty">Dynasty</a-radio-button>
                          <a-radio-button value="redraft">Redraft</a-radio-button>
                        </a-radio-group>

                        <a-switch
                          size="default"
                          v-model:checked="tradeState.checked1"
                          checked-children="Superflex"
                          un-checked-children="OneQB"
                          class="format-switch"
                        />
                      </div>

                      <div class="settings-group">
                        <div class="team-size-selector">
                          <a-select
                            v-model:value="tradeDropDownValue1"
                            :options="tradeDropDownOptions1"
                            @change="tradeDropDownHandleChange"
                            size="middle"
                            style="width: 70px"
                          />
                          <span class="team-label">Team</span>
                        </div>

                        <a-checkbox
                          v-model:checked="tradeTepCheck"
                          @change="onCheckTepChange"
                          class="tep-check"
                        >
                          TE Premium
                        </a-checkbox>
                      </div>
                    </div>

                    <div class="action-buttons">
                      <a-dropdown-button type="default" size="middle">
                        Share
                        <template #overlay>
                          <a-menu @click="handleTradeShareClick">
                            <a-menu-item v-for="source in shareTradeSources" :key="source.key">
                              <img class="social-logos" :src="source.logo" />
                              <span style="margin-left: 8px">{{ source.name }}</span>
                            </a-menu-item>
                          </a-menu>
                        </template>
                        <template #icon><ShareAltOutlined /></template>
                      </a-dropdown-button>

                      <a-button type="text" @click="showTradeModal" class="help-button">
                        <QuestionCircleOutlined />
                        <span class="help-text">How it works</span>
                      </a-button>
                    </div>
                  </a-card>

                  <!-- Trade Teams Section -->
                  <div class="trade-teams">
                    <!-- Team A -->
                    <a-card
                      class="team-card"
                      :bordered="false"
                      :class="{
                        'card-outline-balanced':
                          isFairTrade &&
                          (selectedPlayers1.length > 0 || selectedPlayers2.length > 0),
                        'card-outline-winning': bFavoredTrade,
                        'card-outline-losing': aFavoredTrade
                      }"
                    >
                      <template #title>
                        <div class="team-header">
                          <h2>Team A</h2>
                          <div
                            class="team-value"
                            :class="{
                              'value-favorable': aFavoredTrade,
                              'value-balanced': isFairTrade
                            }"
                          >
                            <span v-if="selectedPlayers1.length > 0">{{
                              Math.round(totalValueSideA).toLocaleString()
                            }}</span>
                          </div>
                        </div>
                      </template>

                      <!-- Manager Selector for Team A -->
                      <div class="manager-selector-container">
                        <a-select
                          v-model:value="selectedTradeManagerA"
                          placeholder="Select a manager"
                          style="width: 100%"
                          size="large"
                          @change="onTradeManagerAChange"
                        >
                          <a-select-option
                            v-for="manager in sortedSummaryData"
                            :key="manager.user_id"
                            :value="manager.user_id"
                          >
                            <div class="manager-option">
                              <a-avatar
                                :src="`https://sleepercdn.com/avatars/thumbs/${manager.avatar}`"
                                :size="24"
                                class="manager-avatar-small"
                              />
                              <span class="manager-name-option">{{ manager.display_name }}</span>
                            </div>
                          </a-select-option>
                        </a-select>
                      </div>

                      <!-- Position groups toggle buttons -->
                      <div v-if="selectedTradeManagerA" class="position-toggle-controls">
                        <div class="position-toggle-buttons">
                          <a-button
                            type="link"
                            size="small"
                            @click="toggleAllPositionGroups('A', !areAllPositionsExpanded('A'))"
                          >
                            <template v-if="areAllPositionsExpanded('A')">
                              <UpOutlined /> Collapse All
                            </template>
                            <template v-else> <DownOutlined /> Expand Players </template>
                          </a-button>
                          <a-button
                            type="link"
                            size="small"
                            @click="togglePositionsVisibility('A')"
                          >
                            <template v-if="showTradePositions.A">
                              <EyeInvisibleOutlined /> Hide Positions
                            </template>
                            <template v-else> <EyeOutlined /> Show Positions </template>
                          </a-button>
                        </div>
                      </div>

                      <!-- Trade Assets Grouped by Position for Team A -->
                      <div
                        v-if="selectedTradeManagerA && showTradePositions.A"
                        class="trade-assets-container"
                      >
                        <div
                          v-for="position in ['QB', 'RB', 'WR', 'TE', 'PICKS']"
                          :key="`teamA-${position}`"
                          class="trade-position-group"
                        >
                          <div
                            class="trade-position-header"
                            :class="`trade-position-header-${position.toLowerCase()}`"
                            @click="toggleTradePositionGroup('A', position)"
                          >
                            <span class="trade-position-title">{{ position }}</span>
                            <span class="trade-position-count">
                              {{
                                getManagerAssetsByPosition(selectedTradeManagerA, position).length
                              }}
                            </span>
                            <DownOutlined
                              v-if="!isTradePositionExpanded('A', position)"
                              class="trade-position-expand-icon"
                            />
                            <UpOutlined v-else class="trade-position-expand-icon" />
                          </div>
                          <div
                            v-if="isTradePositionExpanded('A', position)"
                            class="trade-position-assets"
                          >
                            <div
                              v-for="asset in getManagerAssetsByPosition(
                                selectedTradeManagerA,
                                position
                              )"
                              :key="`teamA-${position}-${asset.sleeper_id || asset.full_name}`"
                              class="trade-asset-item"
                              :style="getPositionTagList(asset.player_position, 0.15)"
                              @click="addAssetToTrade(asset, 1)"
                              :class="{ 'asset-in-trade': isAssetInTrade(asset, 1) }"
                            >
                              <div class="trade-asset-details">
                                <div class="trade-asset-name">{{ asset.full_name }}</div>
                                <div class="trade-asset-meta">
                                  <span v-if="asset.team" class="trade-asset-team">{{
                                    asset.team
                                  }}</span>
                                  <span v-if="asset.age" class="trade-asset-age"
                                    >{{ asset.age }}y</span
                                  >
                                </div>
                              </div>
                              <div class="trade-asset-value">
                                {{ asset.player_value.toLocaleString() }}
                                <PlusCircleTwoTone
                                  v-if="!isAssetInTrade(asset, 1)"
                                  class="trade-asset-add-icon"
                                />
                                <CheckCircleTwoTone
                                  v-else
                                  class="trade-asset-check-icon"
                                  two-tone-color="#52c41a"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Selected Assets for Team A -->
                      <div class="players-container">
                        <div
                          v-for="(player, index) in selectedPlayers1"
                          :key="player.player_full_name + index + '_teamA'"
                        >
                          <div
                            :bordered="false"
                            class="player-item"
                            :style="{
                              borderLeft: `4px solid ${getTradePositionColor(player._position || player.player_position)}`
                            }"
                          >
                            <div class="player-details-wrapper">
                              <div class="player-name-info">
                                <div class="player-name">
                                  {{ player.player_full_name || player.full_name }}
                                </div>
                                <div>
                                  <span
                                    class="player-position"
                                    :style="{
                                      color: getTradePositionColor(
                                        player._position || player.player_position
                                      )
                                    }"
                                  >
                                    {{ player._position || player.player_position }}
                                  </span>
                                  <span
                                    class="player-age"
                                    v-if="player.age"
                                    style="margin-left: 5px"
                                    >Age: {{ player.age }}</span
                                  >
                                </div>
                              </div>
                              <div class="player-value-container">
                                <div class="player-value">
                                  {{ player.sf_value || player.player_value }}
                                </div>
                                <button class="remove-player" @click="removePlayer1(index)">
                                  <MinusCircleTwoTone two-tone-color="#f5222d" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-if="showAdjustmentA" class="adjustment-card">
                          <a-card size="small" :bordered="true" class="va-card">
                            <div class="card-content">
                              <span>Value Modifier</span>
                              <span class="player-value">+{{ Math.round(adjustmentValueA) }}</span>
                            </div>
                          </a-card>
                        </div>
                      </div>

                      <div class="team-summary">
                        <div class="asset-count">
                          <span style="font-weight: bold">{{ selectedPlayers1.length }}</span>
                          Asset{{ selectedPlayers1.length !== 1 ? 's' : '' }}
                        </div>
                        <div class="total-value-display">
                          Total:
                          <span style="font-weight: bold">{{
                            Math.round(totalValueSideA).toLocaleString()
                          }}</span>
                        </div>
                      </div>
                    </a-card>

                    <div class="trade-evaluation">
                      <TradeBalanceVisualizer
                        :valueA="totalValueSideA"
                        :valueB="totalValueSideB"
                        :isFair="isFairTrade"
                        :balancingValue="balancingPlayerValue"
                        :acceptableVariance="
                          (tradePercentThreshold * (totalValueSideA + totalValueSideB)) / 200
                        "
                        :teamAName="'Team A'"
                        :teamBName="'Team B'"
                        class="balance-visualizer-spacing"
                      />
                    </div>

                    <a-card
                      class="team-card"
                      :bordered="false"
                      :class="{
                        'card-outline-balanced':
                          isFairTrade &&
                          (selectedPlayers1.length > 0 || selectedPlayers2.length > 0),
                        'card-outline-winning': aFavoredTrade,
                        'card-outline-losing': bFavoredTrade
                      }"
                    >
                      <template #title>
                        <div class="team-header">
                          <h2>Team B</h2>
                          <div
                            class="team-value"
                            :class="{
                              'value-favorable': bFavoredTrade,
                              'value-balanced': isFairTrade
                            }"
                          >
                            <span v-if="selectedPlayers2.length > 0">{{
                              Math.round(totalValueSideB).toLocaleString()
                            }}</span>
                          </div>
                        </div>
                      </template>

                      <!-- Manager Selector for Team B -->
                      <div class="manager-selector-container">
                        <a-select
                          v-model:value="selectedTradeManagerB"
                          placeholder="Select a manager"
                          style="width: 100%"
                          size="large"
                          @change="onTradeManagerBChange"
                        >
                          <a-select-option
                            v-for="manager in sortedSummaryData"
                            :key="manager.user_id"
                            :value="manager.user_id"
                          >
                            <div class="manager-option">
                              <a-avatar
                                :src="`https://sleepercdn.com/avatars/thumbs/${manager.avatar}`"
                                :size="24"
                                class="manager-avatar-small"
                              />
                              <span class="manager-name-option">{{ manager.display_name }}</span>
                            </div>
                          </a-select-option>
                        </a-select>
                      </div>

                      <!-- Position groups toggle buttons -->
                      <div v-if="selectedTradeManagerB" class="position-toggle-controls">
                        <div class="position-toggle-buttons">
                          <a-button
                            type="link"
                            size="small"
                            @click="toggleAllPositionGroups('B', !areAllPositionsExpanded('B'))"
                          >
                            <template v-if="areAllPositionsExpanded('B')">
                              <UpOutlined /> Collapse All
                            </template>
                            <template v-else> <DownOutlined /> Expand Players </template>
                          </a-button>
                          <a-button
                            type="link"
                            size="small"
                            @click="togglePositionsVisibility('B')"
                          >
                            <template v-if="showTradePositions.B">
                              <EyeInvisibleOutlined /> Hide Positions
                            </template>
                            <template v-else> <EyeOutlined /> Show Positions </template>
                          </a-button>
                        </div>
                      </div>

                      <!-- Trade Assets Grouped by Position for Team B -->
                      <div
                        v-if="selectedTradeManagerB && showTradePositions.B"
                        class="trade-assets-container"
                      >
                        <div
                          v-for="position in ['QB', 'RB', 'WR', 'TE', 'PICKS']"
                          :key="`teamB-${position}`"
                          class="trade-position-group"
                        >
                          <div
                            class="trade-position-header"
                            :class="`trade-position-header-${position.toLowerCase()}`"
                            @click="toggleTradePositionGroup('B', position)"
                          >
                            <span class="trade-position-title">{{ position }}</span>
                            <span class="trade-position-count">
                              {{
                                getManagerAssetsByPosition(selectedTradeManagerB, position).length
                              }}
                            </span>
                            <DownOutlined
                              v-if="!isTradePositionExpanded('B', position)"
                              class="trade-position-expand-icon"
                            />
                            <UpOutlined v-else class="trade-position-expand-icon" />
                          </div>
                          <div
                            v-if="isTradePositionExpanded('B', position)"
                            class="trade-position-assets"
                          >
                            <div
                              v-for="asset in getManagerAssetsByPosition(
                                selectedTradeManagerB,
                                position
                              )"
                              :key="`teamB-${position}-${asset.sleeper_id || asset.full_name}`"
                              class="trade-asset-item"
                              :style="getPositionTagList(asset.player_position, 0.15)"
                              @click="addAssetToTrade(asset, 2)"
                              :class="{ 'asset-in-trade': isAssetInTrade(asset, 2) }"
                            >
                              <div class="trade-asset-details">
                                <div class="trade-asset-name">{{ asset.full_name }}</div>
                                <div class="trade-asset-meta">
                                  <span v-if="asset.team" class="trade-asset-team">{{
                                    asset.team
                                  }}</span>
                                  <span v-if="asset.age" class="trade-asset-age"
                                    >{{ asset.age }}y</span
                                  >
                                </div>
                              </div>
                              <div class="trade-asset-value">
                                {{ asset.player_value.toLocaleString() }}
                              </div>
                              <PlusCircleTwoTone
                                v-if="!isAssetInTrade(asset, 2)"
                                class="trade-asset-add-icon"
                              />
                              <CheckCircleTwoTone
                                v-else
                                class="trade-asset-check-icon"
                                two-tone-color="#52c41a"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="players-container">
                        <div
                          v-for="(player, index) in selectedPlayers2"
                          :key="player.player_full_name + index + '_teamB'"
                        >
                          <div
                            size="small"
                            :bordered="false"
                            class="player-item"
                            :style="{
                              borderLeft: `4px solid ${getTradePositionColor(player._position || player.player_position)}`
                            }"
                          >
                            <div class="player-details-wrapper">
                              <div class="player-name-info">
                                <div class="player-name">
                                  {{ player.player_full_name || player.full_name }}
                                </div>
                                <div>
                                  <span
                                    class="player-position"
                                    :style="{
                                      color: getTradePositionColor(
                                        player._position || player.player_position
                                      )
                                    }"
                                  >
                                    {{ player._position || player.player_position }}
                                  </span>
                                  <span
                                    class="player-age"
                                    v-if="player.age"
                                    style="margin-left: 5px"
                                    >Age: {{ player.age }}</span
                                  >
                                </div>
                              </div>
                              <div class="player-value-container">
                                <div class="player-value">
                                  {{ player.sf_value || player.player_value }}
                                </div>
                                <button class="remove-player" @click="removePlayer2(index)">
                                  <MinusCircleTwoTone two-tone-color="#f5222d" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-if="showAdjustmentB" class="adjustment-card">
                          <a-card size="small" :bordered="true" class="va-card">
                            <div class="card-content">
                              <span>Value Modifier</span>
                              <span class="player-value">+{{ Math.round(adjustmentValueB) }}</span>
                            </div>
                          </a-card>
                        </div>
                      </div>

                      <div class="team-summary">
                        <div class="asset-count">
                          <span style="font-weight: bold">{{ selectedPlayers2.length }}</span>
                          Asset{{ selectedPlayers2.length !== 1 ? 's' : '' }}
                        </div>
                        <div class="total-value-display">
                          Total:
                          <span style="font-weight: bold">{{
                            Math.round(totalValueSideB).toLocaleString()
                          }}</span>
                        </div>
                      </div>
                    </a-card>
                  </div>

                  <a-card
                    v-if="
                      tradeAnalysisComputed.percentageDifference > tradePercentThreshold &&
                      closestBalancingPlayers.length > 0
                    "
                    class="balancing-players-card"
                  >
                    <template #title>
                      <div class="balancing-title">
                        <h3>Balance the Trade</h3>
                        <a-tooltip title="These players could help balance the trade">
                          <InfoCircleOutlined style="margin-left: 8px" />
                        </a-tooltip>
                      </div>
                    </template>
                    <div class="balancing-players-container">
                      <div
                        v-for="player in displayedBalancingPlayers"
                        :key="player.player_full_name + '_balancing'"
                        class="balancing-player-card"
                      >
                        <div
                          :bordered="false"
                          class="player-item"
                          :style="{
                            borderLeft: `4px solid ${getTradePositionColor(player._position)}`
                          }"
                          hoverable
                          @click="addPlayerToTrade(player)"
                        >
                          <div class="player-details-wrapper">
                            <div class="player-name-info">
                              <div class="player-name">
                                {{ player.player_full_name }}
                              </div>
                              <div>
                                <span
                                  class="player-position"
                                  :style="{ color: getTradePositionColor(player._position) }"
                                >
                                  {{ player._position }}
                                </span>
                                <span class="player-age" v-if="player.age" style="margin-left: 5px"
                                  >Age: {{ player.age }}</span
                                >
                              </div>
                            </div>
                            <div class="player-value-container">
                              <div class="player-value">
                                {{ tradeState.checked1 ? player.sf_value : player.one_qb_value }}
                              </div>
                              <PlusCircleTwoTone class="add-player-icon" two-tone-color="#52c41a" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="view-more" v-if="closestBalancingPlayers.length > 6">
                      <a-button type="link" @click="toggleShowAllBalancingPlayers">
                        {{ showAllBalancingPlayers ? 'View Less Players' : 'View More Players' }}
                      </a-button>
                    </div>
                  </a-card>

                  <a-card class="trade-controls-card">
                    <a-row :gutter="[16, 16]" align="middle">
                      <a-col :xs="24" :sm="16" :md="18">
                        <div class="slider-container">
                          <div class="slider-label">
                            Acceptable Trade Variance: {{ tradePercentThreshold }}%
                          </div>
                          <a-slider
                            v-model:value="tradePercentThreshold"
                            :min="1"
                            :max="25"
                            :step="1"
                          />
                        </div>
                      </a-col>
                      <a-col :xs="24" :sm="8" :md="6" class="clear-button-container">
                        <a-button @click="clearTradeCalculator" danger block
                          >Clear Calculator</a-button
                        >
                      </a-col>
                    </a-row>
                  </a-card>
                </div>

                <a-modal
                  v-model:open="tradeModalOpen"
                  @ok="handleTradeModalOk"
                  title="How the Trade Calculator Works"
                >
                  <p>
                    Fantasy Navigator Rankings are derived from an extensive array of sources,
                    including millions of crowd-sourced data points, expert consensus rankings, and
                    real trade analyses. This comprehensive approach ensures that our rankings are
                    not only well-informed but also reflect the most current trends and insights in
                    fantasy sports.
                  </p>
                  <p>
                    The calculator accounts for value consolidation, meaning that higher-valued
                    players are worth more than the sum of multiple lower-valued players. This
                    provides a more realistic assessment of fantasy football trades.
                  </p>
                </a-modal>
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
                    <div
                      class="team-card"
                      :class="{
                        'selected-team':
                          clickedManager !== '' && clickedManager === manager.display_name,
                        'dimmed-team':
                          clickedManager !== '' && clickedManager !== manager.display_name,
                        'elite-team': getTeamTier(manager).tier === 'Elite',
                        'strong-team': getTeamTier(manager).tier === 'Strong',
                        'average-team': getTeamTier(manager).tier === 'Average',
                        'developing-team': getTeamTier(manager).tier === 'Developing'
                      }"
                    >
                      <!-- Team Level Indicators (shown when a manager is selected) -->
                      <div
                        v-if="clickedManager !== '' && clickedManager === manager.display_name"
                        class="team-level-indicators"
                      >
                        <div class="team-tier-badge" :class="getTeamTier(manager).class">
                          {{ getTeamTier(manager).tier }}
                        </div>
                        <div class="position-strength-indicators">
                          <div
                            v-for="pos in ['QB', 'RB', 'WR', 'TE']"
                            :key="pos"
                            class="position-strength"
                            :class="getPositionStrengthClass(manager, pos)"
                            :title="`${pos}: ${addOrdinalSuffix(getPositionRank(manager, pos))}`"
                          >
                            {{ pos }}
                          </div>
                        </div>
                      </div>

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
                </div>

                <!-- Main Positions Row (QB, RB, WR, TE) -->
                <a-row class="justify-center-row main-positions-row" :gutter="[12, 20]">
                  <a-col
                    v-for="(players, position) in mainPositionPlayers"
                    :key="position"
                    :xs="12"
                    :sm="12"
                    :md="6"
                    :lg="6"
                    :xl="6"
                    class="position-group-col"
                  >
                    <div class="position-group-container main-position-container">
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
                          @click="showPlayerModal(player)"
                        >
                          <span
                            :class="{
                              'dimmed-text':
                                clickedManager !== '' && clickedManager !== player.display_name
                            }"
                            class="player-name"
                          >
                            {{ index + 1 }}. {{ player?.full_name }} {{ player?.team }}
                            <span class="font-size-11">{{ player?.age }}yrs</span>
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

                <!-- Picks Section -->
                <a-row v-if="playersByPosition.PICKS" class="picks-row" :gutter="[12, 20]">
                  <a-col :span="24">
                    <div class="position-group-container picks-container">
                      <h3 class="position-group-title picks-title">
                        <span>DRAFT PICKS</span>
                        <span class="picks-count"
                          >({{ playersByPosition.PICKS.length }} total)</span
                        >
                      </h3>
                      <div class="picks-grid">
                        <div
                          v-for="(player, index) in playersByPosition.PICKS"
                          :key="player.sleeper_id"
                          :style="getPositionTagList(player.player_position, 0.2)"
                          class="pick-item"
                          :class="{
                            lighter: clickedManager !== '' && clickedManager !== player.display_name
                          }"
                        >
                          <span
                            :class="{
                              'dimmed-text':
                                clickedManager !== '' && clickedManager !== player.display_name
                            }"
                            class="pick-name"
                          >
                            {{ index + 1 }}. {{ player?.full_name }}
                          </span>
                          <span class="pick-value">
                            {{
                              player.player_value === -1
                                ? 'N/A'
                                : player.player_value?.toLocaleString()
                            }}
                          </span>
                          <span class="pick-owner">{{ player.display_name }}</span>
                        </div>
                      </div>
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
                              <span class="manager-value-label"
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
                        <template
                          v-for="(player, index) in chunk"
                          :key="`template-${player.sleeper_id}`"
                        >
                          <li
                            :style="getPositionTagList(player.player_position, 0.2)"
                            class="player-chunk-item"
                            :class="{
                              lighter:
                                clickedManager !== '' && clickedManager !== player.display_name
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
                          <!-- Manager divider line -->
                          <li
                            v-if="shouldShowDividerAfter(index + chunkIndex * 50)"
                            class="league-assets-divider"
                          >
                            <div class="divider-line">
                              <span class="divider-text"></span>
                            </div>
                          </li>
                        </template>
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

              <h3>Trade Calculator</h3>
              <p>
                Evaluate potential trades between teams using advanced metrics and player rankings.
                The trade calculator helps you determine fair value and suggests balancing players
                to make trades equitable.
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
                  <strong>Value</strong>
                  {{
                    selectedPlayer.player_value === -1
                      ? 'N/A'
                      : selectedPlayer.player_value?.toLocaleString()
                  }}
                </p>
                <p><strong>Manager</strong> {{ selectedPlayer.display_name }}</p>
              </div>
            </div>
            <div v-else>
              <p>Loading player details...</p>
            </div>
          </a-modal>
        </a-spin>
      </div>
    </a-layout-content>
    <!-- About Section for Google AdSense Approval -->
    <div class="about-site-section">
      <h1 class="about-site-title">About Fantasy Navigator</h1>
      <p>
        Fantasy Navigator is an advanced fantasy football analytics platform designed to help users
        analyze, compare, and optimize their fantasy football leagues. Our tools provide unique
        insights, power rankings, trade calculators, and player value breakdowns using a blend of
        expert consensus, crowd-sourced data, and real trade analysis. Whether you're a seasoned
        fantasy manager or new to the game, Fantasy Navigator offers actionable data to help you
        make smarter decisions and win your league.
      </p>
      <p style="font-size: 0.95em; color: #888">
        Fantasy Navigator is an independent project and is not affiliated with the NFL, Sleeper,
        ESPN, Yahoo, or any official fantasy sports provider.
      </p>
    </div>
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
import TradeBalanceVisualizer from '@/components/TradeBalanceVisualizer.vue'

// Third-Party Libraries
import axios from 'axios'
import { message, Empty, MenuProps } from 'ant-design-vue'
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
import xLogo from '@/assets/socialLogos/x.png'
import redditLogo from '@/assets/socialLogos/reddit.png'

// Icons
import {
  PlusCircleTwoTone,
  MinusCircleTwoTone,
  ShareAltOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined,
  CheckCircleTwoTone,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons-vue'

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
const clickedManager = ref('') // Tracks clicked manager for highlighting in Position Groups/League Assets

// Data Filters & Selected Options
const overallFilter = ref('all') // Player filter: 'all' or 'STARTER'
const value1 = ref('espn') // Selected projection source (e.g., 'espn', 'cbs')
const selectedPlayer = ref(null) // Holds data for the player modal
const selectedUser = ref(null) // Holds data for the selected manager in certain tabs

// League Information (from route params)
const leagueInfo = reactive({
  leagueName: route.params.leagueName,
  leagueId: route.params.leagueId,
  userName: route.params.userName,
  leagueYear: route.params.leagueYear,
  guid: route.params.guid,
  rankType: route.params.rankType,
  platform: route.params.platform,
  userId: route.params.userId,
  rosterType: route.params.rosterType,
  avatar: route.params.avatar,
  leagueType: route.params.leagueType,
  apiSource: route.params.platform
})

// Data Holders
const summaryData = ref([])
const detailData = ref([{}])
const projDetailData = ref([{}])
const projSummaryData = ref([{}])
const tradesDetailData = ref([{}])
const tradesSummaryData = ref([{}])
const bestAvailableData = ref([{}])

// Chart Data
const bchartData = ref([])
const scatterPlotData = ref([])
const projectionBarChartData = ref([])
const projectionPercentColumnData = ref([])

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
    return [...projSummaryData.value].sort((a, b) =>
      overallFilter.value === 'all'
        ? a.total_rank - b.total_rank
        : a.starters_rank - b.starters_rank
    )
  }
  if (summaryData.value.length > 0) {
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
const createPositionColumnsConfig = (filterValue) => {
  const positions = ['QB', 'RB', 'WR', 'TE']
  return positions.map((position) => {
    const dataKey =
      filterValue === 'all'
        ? `${position.toLowerCase()}_rank`
        : `${position.toLowerCase()}_starter_rank`
    return {
      title: position,
      dataIndex: dataKey,
      key: `${position.toLowerCase()}_rank`,
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
      title: 'Total Value',
      dataIndex: overallFilter.value === 'all' ? 'total_value' : 'starters_sum',
      key: 'total_value_col',
      align: 'center',
      customRender: ({ record }) => {
        const value = overallFilter.value === 'all' ? record.total_value : record.starters_sum
        return value?.toLocaleString() ?? 'N/A'
      },
      sorter: (a, b) => {
        const valA = overallFilter.value === 'all' ? a.total_value : a.starters_sum
        const valB = overallFilter.value === 'all' ? b.total_value : b.starters_sum
        return (valA ?? 0) - (valB ?? 0)
      }
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
    title: 'Total Value',
    dataIndex: overallFilter.value === 'all' ? 'total_value' : 'starters_sum',
    key: 'total_value_proj_col',
    align: 'center',
    customRender: ({ record }) => {
      const value = overallFilter.value === 'all' ? record.total_value : record.starters_sum
      return value?.toLocaleString() ?? 'N/A'
    },
    sorter: (a, b) => {
      const valA = overallFilter.value === 'all' ? a.total_value : a.starters_sum
      const valB = overallFilter.value === 'all' ? b.total_value : b.starters_sum
      return (valA ?? 0) - (valB ?? 0)
    }
  },
  {
    title: overallFilter.value === 'all' ? 'Overall' : 'Starters',
    dataIndex: overallFilter.value === 'all' ? 'total_rank' : 'starters_rank',
    key: 'overall_rank_proj',
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
])

// Player data sorted for "League Assets" tab, chunked for display
const sortedFilteredData = computed(() => {
  const players = filteredData.value.filter((a) => a.player_position !== 'PICKS')
  const picks = filteredData.value.filter((a) => a.player_position === 'PICKS')
  const sortedPlayers = [...players].sort((a, b) => b.player_value - a.player_value)
  const sortedPicks = sortPicks(picks)
  return [...sortedPlayers, ...sortedPicks]
})

const playerChunks = computed(() => {
  const size = 50
  return sortedFilteredData.value.reduce((acc, val, i) => {
    const idx = Math.floor(i / size)
    acc[idx] = acc[idx] || []
    acc[idx].push(val)
    return acc
  }, [])
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

// Filtered players by position excluding PICKS
const mainPositionPlayers = computed(() => {
  const positions = playersByPosition.value
  const filtered = {}
  Object.keys(positions).forEach((position) => {
    if (position !== 'PICKS') {
      filtered[position] = positions[position]
    }
  })
  return filtered
})

// Calculate divider line positions for League Assets (every 12 managers)
const leagueAssetDividers = computed(() => {
  const managerCount = summaryData.value.length
  const dividerPositions = []

  // Create dividers at 12, 24, 36, etc.
  for (let i = 12; i < sortedFilteredData.value.length; i += managerCount) {
    dividerPositions.push(i)
  }

  return dividerPositions
})

// Helper function to check if a specific index should have a divider after it
const shouldShowDividerAfter = (globalIndex) => {
  return leagueAssetDividers.value.includes(globalIndex + 1)
}

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
  }
  if (projSummaryData.value.length) {
    updateProjectionData(projSummaryData.value)
  }
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

// Watch for changes in selectedSource to handle tab switching
watch(selectedSource, (newSource) => {
  if (activeKey.value === '6' && newSource.key !== 'sf') {
    activeKey.value = '1' // Switch to Power Rankings tab if Trade Calculator is not available
    message.info('Trade Calculator is only available when using FantasyNavigator rankings')
  }
})

// --- Lifecycle Hooks ---

onMounted(() => {
  if (
    leagueInfo.leagueId &&
    leagueInfo.platform &&
    leagueInfo.rankType &&
    leagueInfo.guid &&
    leagueInfo.userId
  ) {
    insertLeagueDetials()
  }
})

// --- Core Logic & Data Fetching ---

function sortPicks(picks) {
  const roundOrder = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5 }
  const tierOrder = { Early: 1, Mid: 2, Late: 3 }

  return [...picks].sort((a, b) => {
    const nameA = a.full_name || ''
    const nameB = b.full_name || ''

    const yearA = parseInt(nameA.substring(0, 4)) || 9999
    const yearB = parseInt(nameB.substring(0, 4)) || 9999
    if (yearA !== yearB) return yearA - yearB

    const roundMatchA = nameA.match(/(\d+)(st|nd|rd|th)/)
    const roundMatchB = nameB.match(/(\d+)(st|nd|rd|th)/)
    const roundNumA = roundMatchA ? parseInt(roundMatchA[1]) : 99
    const roundNumB = roundMatchB ? parseInt(roundMatchB[1]) : 99
    if (roundNumA !== roundNumB) return roundNumA - roundNumB

    const tierMatchA = nameA.match(/(Early|Mid|Late)/)
    const tierMatchB = nameB.match(/(Early|Mid|Late)/)
    const tierValA = tierMatchA ? tierOrder[tierMatchA[1]] : 2
    const tierValB = tierMatchB ? tierOrder[tierMatchB[1]] : 2
    if (tierValA !== tierValB) return tierValA - tierValB

    const pickNumMatchA = nameA.match(/(\d+)\.(\d+)/)
    const pickNumMatchB = nameB.match(/(\d+)\.(\d+)/)
    const pickValA = pickNumMatchA
      ? parseInt(pickNumMatchA[1]) * 100 + parseInt(pickNumMatchA[2])
      : 9999
    const pickValB = pickNumMatchB
      ? parseInt(pickNumMatchB[1]) * 100 + parseInt(pickNumMatchB[2])
      : 9999
    if (pickValA !== pickValB) return pickValA - pickValB

    return b.player_value - a.player_value
  })
}

const calculatePercentileThresholds = (data, percentile = 75) => {
  if (!data || data.length === 0) return {}

  const thresholds = {}
  const positions = ['QB', 'RB', 'WR', 'TE']

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

const insertLeagueDetials = async (leagueIdParam) => {
  const currentLeagueId = leagueIdParam || leagueInfo.leagueId
  Object.keys(cacheStore.cache).forEach((key) => {
    if (key.includes(currentLeagueId.toString())) {
      cacheStore.remove(key)
    }
  })

  isLoading.value = true
  detailIsLoading.value = true
  summaryIsLoading.value = true
  console.log('Attempting to insert/update rosters for league:', currentLeagueId)

  const cacheBuster = Date.now().toString()

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
    isLoading.value = false

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
    fetchProjectionData(leagueInfo.leagueId, value1.value, leagueInfo.guid, cacheBuster)
  }
}

async function fetchProjectionData(leagueId, projectionSource, guid, cacheBuster) {
  isProjectionLoading.value = true
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 2000

  const params = { league_id: leagueId, projection_source: projectionSource, guid: guid }
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

      updateProjectionData(summaryResponse.data)
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

async function fetchSummaryData(
  leagueId,
  platform,
  rankType,
  guid,
  rosterType,
  leagueType,
  cacheBuster
) {
  summaryIsLoading.value = true
  const cacheKey = `summary_${leagueId}_${platform}_${rankType}_${guid}_${rosterType}_${leagueType}`

  if (!cacheBuster && cacheStore.has(cacheKey)) {
    const cachedData = cacheStore.get(cacheKey)
    summaryData.value = cachedData
    updateBchartData(cachedData)
    summaryIsLoading.value = false
    console.log('Using cached summary data.')
    return
  }

  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500
  const params = {
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
          picks_percent: item.total_value ? (item.picks_sum / item.total_value) * 100 : 0
        }))
        cacheStore.set(cacheKey, processedData)
        summaryData.value = processedData
        updateBchartData(rawData)
        console.log('League summary data fetched successfully.')
        break
      } catch (error) {
        console.error(`Error fetching league summary (Attempt ${retryCount + 1}):`, error.message)
        retryCount++
        if (retryCount < maxRetries) await sleep(retryDelay)
        else throw error
      }
    }
  } catch (error) {
    console.error('Failed to fetch league summary data after retries.')
    message.error('Failed to load league summary. Please try again.')
  } finally {
    summaryIsLoading.value = false
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

async function fetchDetailData(leagueId, platform, rankType, guid, rosterType, cacheBuster) {
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
  const params = {
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
        break
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

async function fetchBaData(leagueId, platform, rankType, guid, rosterType, cacheBuster) {
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
  const params = {
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
        break
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

async function fetchTrades(leagueId, platformApi, rosterType, leagueYear, rankType, cacheBuster) {
  let retryCount = 0
  const maxRetries = 3
  const retryDelay = 500
  const params = {
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
        return
      } catch (error) {
        console.error('Error fetching trades data:', error)
        retryCount++
        if (retryCount < maxRetries) await sleep(retryDelay)
        else throw error
      }
    }
  } catch (error) {
    console.error('Failed to fetch trade data after retries.')
    message.error('Failed to load trade data. Please try again.')
  }
}

// --- Event Handlers ---

const handleMenuClick = (e) => {
  const newPlatform = e.key
  selectedSource.value = sources.find((s) => s.key === newPlatform) || sources[0]
  leagueInfo.apiSource = newPlatform

  const cacheBuster = Date.now().toString()
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

const handleProjChange = async (projectionSource) => {
  fetchProjectionData(leagueInfo.leagueId, projectionSource, leagueInfo.guid, Date.now().toString())
}

const handleViewToggle = (checked) => {
  showProjections.value = checked
  if (checked) {
    if (projSummaryData.value.length === 0 || projDetailData.value.length === 0) {
      fetchProjectionData(leagueInfo.leagueId, value1.value, leagueInfo.guid, Date.now().toString())
    }
    if (selectedUser.value) {
      const projUser = projSummaryData.value.find((p) => p.user_id === selectedUser.value.user_id)
      if (projUser) selectedUser.value = projUser
    }
  } else {
    if (selectedUser.value) {
      const overallUser = summaryData.value.find((s) => s.user_id === selectedUser.value.user_id)
      if (overallUser) selectedUser.value = overallUser
    }
  }
}

function handleUserClick(user) {
  clickedManager.value = clickedManager.value === user.display_name ? '' : user.display_name
  if (selectedUser.value && selectedUser.value.user_id === user.user_id) {
    selectedUser.value = null
  } else {
    selectedUser.value = user
  }
}

const getLeagueSummary = async () => {
  try {
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
const showPlayerModal = (player) => {
  selectedPlayer.value = player
  isPlayerModalVisible.value = true
}
const handlePlayerModalOk = () => {
  isPlayerModalVisible.value = false
}

// Expand/Collapse Handlers for UI elements
function toggleExpand(userId) {
  expandedTeams[userId] = !expandedTeams[userId]
}
const toggleMobileManagerExpand = (userId) => {
  expandedMobileManagers.value[userId] = !expandedMobileManagers.value[userId]
  if (!expandedMobileManagers.value[userId]) {
    expandedMobileManagerPosition.value[userId] = null
  }
}
const toggleMobileManagerPositionExpand = (userId, position) => {
  expandedMobileManagerPosition.value[userId] =
    expandedMobileManagerPosition.value[userId] === position ? null : position
}

// --- Utility Functions & Data Transformations ---

// Chart data update functions
const updateBchartData = (rawData) => {
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

const updateProjectionData = (rawData) => {
  projectionBarChartData.value = rawData.flatMap((item) => {
    const displayName =
      item.display_name.length > 8 ? `${item.display_name.slice(0, 8)}...` : item.display_name
    const positions = ['qb', 'rb', 'wr', 'te']
    return positions.map((pos) => ({
      display_name: displayName,
      value: overallFilter.value === 'all' ? item[`${pos}_sum`] : item[`${pos}_starter_sum`],
      position: pos.toUpperCase(),
      rank: overallFilter.value === 'all' ? item[`${pos}_rank`] : item[`${pos}_starter_rank`]
    }))
  })
}

function getRank(user) {
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

const getPlayers = (userId) => {
  const userAssets = filteredData.value.filter((item) => item.user_id === userId)
  const players = userAssets.filter((a) => a.player_position !== 'PICKS')
  const picks = userAssets.filter((a) => a.player_position === 'PICKS')
  return [...[...players].sort((a, b) => b.player_value - a.player_value), ...sortPicks(picks)]
}

const getPlayersProj = (userId) => {
  const userAssets = filteredProjData.value.filter((item) => item.user_id === userId)
  const players = userAssets.filter((a) => a.player_position !== 'PICKS')
  const picks = userAssets.filter((a) => a.player_position === 'PICKS')
  return [
    ...[...players].sort((a, b) => b.player_value - a.player_value),
    ...(picks.length > 0 ? sortPicks(picks) : [])
  ]
}

const getPlayersForMobilePosition = (userId, position) => {
  const allPlayersForUser = showProjections.value ? getPlayersProj(userId) : getPlayers(userId)
  return allPlayersForUser.filter((p) => p.player_position === position)
}

function getPositionTagList(position, opacity = 0.6) {
  const colors = {
    QB: 'rgb(39, 125, 161',
    RB: 'rgb(144, 190, 109',
    WR: 'rgb(67, 170, 139',
    TE: 'rgb(249, 132, 74',
    PICKS: 'rgb(70, 70, 70'
  }
  const color = colors[position] || 'rgb(0,0,0)'
  return {
    background: `${color}, ${opacity})`,
    'border-color': color,
    border: `1px solid ${color}, ${opacity + 0.2})`
  }
}

const positionTitles = {
  QB: 'Quarterbacks',
  RB: 'Running Backs',
  WR: 'Wide Receivers',
  TE: 'Tight Ends',
  PICKS: 'Draft Picks'
}

// ---------- TRADE CALCULATOR CODE START ----------
const tradePercentThreshold = ref(5)
const tradeValue1 = ref('')
const tradeValue2 = ref('')
const tradeOptions1 = ref([])
const tradeOptions2 = ref([])
const selectedPlayers1 = ref([])
const selectedPlayers2 = ref([])
const tradeIsLoading = ref(false)
const tradeRanksData = ref([{}])
const tradePlatform = ref('sf')
const tradeRankType = ref('dynasty')
const tradeTepCheck = ref(false)
const tradeDropDownValue1 = ref('12')
const tradeModalOpen = ref(false)
let tradeBpv_value = null
const showAllBalancingPlayers = ref(false)

const tradeDropDownOptions1 = ref([
  { value: '8', label: '8' },
  { value: '10', label: '10' },
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' }
])

const tradeState = reactive({
  checked1: true
})

const shareTradeSources = [
  { key: 'x', name: 'X', logo: xLogo },
  { key: 'reddit', name: 'Reddit', logo: redditLogo }
]

const calculateTradeCalculatorIndex = (value) => {
  return tradeRankType.value === 'redraft' ? parseInt(value) * 15 : parseInt(value) * 25
}

const tradeDropDownHandleChange = (value) => {
  const index = calculateTradeCalculatorIndex(value)
  const valueKey = tradeState.checked1 ? 'sf_value' : 'one_qb_value'

  if (tradeRanksData.value && tradeRanksData.value.length > index && index >= 0) {
    const playerAtBPVIndex = tradeRanksData.value[index]
    if (playerAtBPVIndex && typeof playerAtBPVIndex[valueKey] === 'number') {
      tradeBpv_value = playerAtBPVIndex[valueKey]
    } else {
      tradeBpv_value = null
    }
  } else {
    tradeBpv_value = null
  }
}

async function onCheckTepChange(event) {
  const checked = event.target.checked
  const factor = 1.1

  // Apply TE Premium to all players in the data
  tradeRanksData.value.forEach((player) => {
    if (player._position === 'TE') {
      if (checked) {
        player.sf_value = Math.round(player.sf_value * factor)
        player.one_qb_value = Math.round(player.one_qb_value * factor)
      } else {
        player.sf_value = Math.round(player.sf_value / factor)
        player.one_qb_value = Math.round(player.one_qb_value / factor)
      }
    }
  })

  // Update selected players with the new values from tradeRanksData
  selectedPlayers1.value = selectedPlayers1.value.map((player) => {
    if (player._position === 'TE') {
      // Find the updated player data and use it
      const updatedPlayer = tradeRanksData.value.find(
        (p) => p.player_id === player.player_id || p.player_full_name === player.player_full_name
      )
      return updatedPlayer || player
    }
    return player
  })

  selectedPlayers2.value = selectedPlayers2.value.map((player) => {
    if (player._position === 'TE') {
      // Find the updated player data and use it
      const updatedPlayer = tradeRanksData.value.find(
        (p) => p.player_id === player.player_id || p.player_full_name === player.player_full_name
      )
      return updatedPlayer || player
    }
    return player
  })

  // Force reactivity update
  selectedPlayers1.value = [...selectedPlayers1.value]
  selectedPlayers2.value = [...selectedPlayers2.value]

  // Also update any balancing player suggestions that might contain TEs
  message.success(`TE Premium ${checked ? 'enabled' : 'disabled'}`)
}

const tweetPlayers = () => {
  const playerNames1 = selectedPlayers1.value.map((p) => p.player_full_name).join(', ')
  const playerNames2 = selectedPlayers2.value.map((p) => p.player_full_name).join(', ')
  const currentDropDownLabel = tradeDropDownOptions1.value.find(
    (option) => option.value === tradeDropDownValue1.value
  )?.label
  const tepText = tradeTepCheck.value ? 'TEP' : ''
  const tweetText = `${currentDropDownLabel} Team ${tepText}\n${tradeRankType.value.charAt(0).toUpperCase() + tradeRankType.value.slice(1)} ${tradeState.checked1 ? 'Superflex' : 'OneQB'}\nWhich side wins?\nTeam A: ${playerNames1}\nTeam B: ${playerNames2} \n Powered by @fantasynav1\n www.fantasynavigator.com`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
  window.open(tweetUrl, '_blank')
}

const redditPlayers = () => {
  const playerNames1 = selectedPlayers1.value.map((p) => p.player_full_name).join(', ')
  const playerNames2 = selectedPlayers2.value.map((p) => p.player_full_name).join(', ')
  const currentDropDownLabel = tradeDropDownOptions1.value.find(
    (option) => option.value === tradeDropDownValue1.value
  )?.label
  const dynastySubReddit = 'DynastyFFTradeAdvice'
  const redraftSubReddit = 'fantasyfootballadvice'
  const subReddit = tradeRankType.value === 'dynasty' ? dynastySubReddit : redraftSubReddit
  const tepText = tradeTepCheck.value ? 'TEP' : ''
  const redditTitle = 'Which Side Wins?'
  const redditText = `${currentDropDownLabel} Team ${tepText}\n${tradeRankType.value.charAt(0).toUpperCase() + tradeRankType.value.slice(1)} ${tradeState.checked1 ? 'Superflex' : 'OneQB'}\nWhich side wins?\nTeam A: ${playerNames1}\nTeam B: ${playerNames2} \n Powered by @fantasynav1\n www.fantasynavigator.com`
  const redditUrl = `https://www.reddit.com/r/${subReddit}/submit?title=${encodeURIComponent(redditTitle)}&text=${encodeURIComponent(redditText)}`
  window.open(redditUrl, '_blank')
}

const handleTradeShareClick = (item) => {
  if (item.key === 'x') {
    tweetPlayers()
  }
  if (item.key === 'reddit') {
    redditPlayers()
  }
}

const showTradeModal = () => {
  tradeModalOpen.value = true
}
const handleTradeModalOk = () => {
  tradeModalOpen.value = false
}

const rawTotalValue1 = computed(() => {
  return selectedPlayers1.value.reduce((sum, player) => {
    const valueKey = tradeState.checked1 ? 'sf_value' : 'one_qb_value'
    return sum + (player[valueKey] || 0)
  }, 0)
})

const rawTotalValue2 = computed(() => {
  return selectedPlayers2.value.reduce((sum, player) => {
    const valueKey = tradeState.checked1 ? 'sf_value' : 'one_qb_value'
    return sum + (player[valueKey] || 0)
  }, 0)
})

function calculateTradeValueInternal(rawPlayerValues, BPV = tradeBpv_value) {
  if (BPV === null || !isFinite(BPV) || BPV <= 0) return rawPlayerValues.reduce((s, v) => s + v, 0)
  if (
    !Array.isArray(rawPlayerValues) ||
    rawPlayerValues.some((value) => typeof value !== 'number' || !isFinite(value))
  )
    return 0
  if (rawPlayerValues.length === 0) return 0

  const sortedPlayerValues = [...rawPlayerValues].sort((a, b) => b - a)
  const topAssetValue = sortedPlayerValues[0]
  const eliteThreshold = BPV * 2.0
  const highEndThreshold = BPV * 1.2
  const starterThreshold = BPV * 0.8
  let adjustedTotalValue = 0

  sortedPlayerValues.forEach((value) => {
    let multiplier = 0.85
    if (value >= eliteThreshold) multiplier = 1.15
    else if (value >= highEndThreshold) multiplier = 1.05
    else if (value >= starterThreshold) multiplier = 0.95
    adjustedTotalValue += value * multiplier
  })

  if (sortedPlayerValues.length > 1) {
    if (topAssetValue >= eliteThreshold) adjustedTotalValue += topAssetValue * 0.05
    else if (topAssetValue < starterThreshold) adjustedTotalValue *= 0.95
  }
  return Math.max(0, adjustedTotalValue)
}

const totalValueSideA = computed(() => {
  const playerValues = selectedPlayers1.value.map((player) =>
    tradeState.checked1 ? player.sf_value : player.one_qb_value
  )
  return calculateTradeValueInternal(playerValues)
})

const totalValueSideB = computed(() => {
  const playerValues = selectedPlayers2.value.map((player) =>
    tradeState.checked1 ? player.sf_value : player.one_qb_value
  )
  return calculateTradeValueInternal(playerValues)
})

const adjustmentValueA = computed(() =>
  selectedPlayers1.value.length > 0 ? totalValueSideA.value - rawTotalValue1.value : 0
)
const adjustmentValueB = computed(() =>
  selectedPlayers2.value.length > 0 ? totalValueSideB.value - rawTotalValue2.value : 0
)

const showAdjustmentA = computed(() => {
  const numA = selectedPlayers1.value.length
  const numB = selectedPlayers2.value.length
  return numA > 0 && numB > 0 && numA < numB && adjustmentValueA.value > 0.1
})

const showAdjustmentB = computed(() => {
  const numA = selectedPlayers1.value.length
  const numB = selectedPlayers2.value.length
  return numA > 0 && numB > 0 && numB < numA && adjustmentValueB.value > 0.1
})

const searchPlayerSharedLogic = (searchText, ranks) => {
  if (!searchText || searchText.trim().length === 0) return []
  const matchingPlayers = ranks.filter((item) =>
    item.player_full_name?.toLowerCase().includes(searchText.toLowerCase())
  )
  const uniquePlayerMap = new Map()
  matchingPlayers.forEach((player) => {
    const uniqueKey = `${player.player_id}`
    const teamInfo = player.team ? ` - ${player.team}` : ''
    const ageInfo = player.age ? ` (Age: ${player.age})` : ''
    const positionInfo = player._position || ''
    const label = `${player.player_full_name} - ${positionInfo}${teamInfo}${ageInfo}`
    uniquePlayerMap.set(uniqueKey, { label: label, value: player.player_id, data: player })
  })
  const options = Array.from(uniquePlayerMap.values())
  options.sort((a, b) => a.data.player_full_name.localeCompare(b.data.player_full_name))
  return options
}

const searchPlayer1 = (searchText) => {
  tradeOptions1.value = searchPlayerSharedLogic(searchText, tradeRanksData.value)
}
const searchPlayer2 = (searchText) => {
  tradeOptions2.value = searchPlayerSharedLogic(searchText, tradeRanksData.value)
}

const selectPlayer1 = (playerId) => {
  const player = tradeRanksData.value.find((item) => item.player_id === playerId)
  const isAlreadySelected = selectedPlayers1.value.some((p) => p.player_id === player?.player_id)
  const hasSpecialYear = player?.player_full_name.match(/\b(2025|2026|2027)\b/)
  if (player && (!isAlreadySelected || hasSpecialYear)) {
    selectedPlayers1.value.push(player)
  }
  tradeValue1.value = ''
}

const selectPlayer2 = (playerId) => {
  const player = tradeRanksData.value.find((item) => item.player_id === playerId)
  const isAlreadySelected = selectedPlayers2.value.some((p) => p.player_id === player?.player_id)
  const hasSpecialYear = player?.player_full_name.match(/\b(2025|2026|2027)\b/)
  if (player && (!isAlreadySelected || hasSpecialYear)) {
    selectedPlayers2.value.push(player)
  }
  tradeValue2.value = ''
}

const removePlayer1 = (index) => selectedPlayers1.value.splice(index, 1)
const removePlayer2 = (index) => selectedPlayers2.value.splice(index, 1)
const clearTradeCalculator = () => {
  selectedPlayers1.value = []
  selectedPlayers2.value = []
  tradeValue1.value = ''
  tradeValue2.value = ''
  tradeOptions1.value = []
  tradeOptions2.value = []
  selectedTradeManagerA.value = null
  selectedTradeManagerB.value = null

  // Reset expanded position groups
  Object.keys(expandedTradePositions.A).forEach((key) => {
    expandedTradePositions.A[key] = false
  })
  Object.keys(expandedTradePositions.B).forEach((key) => {
    expandedTradePositions.B[key] = false
  })

  // Keep positions visible after clearing
  showTradePositions.A = true
  showTradePositions.B = true
}

const tradeAnalysisComputed = computed(() => {
  const valueA = totalValueSideA.value
  const valueB = totalValueSideB.value
  if (valueA === 0 && valueB === 0) return { percentageDifference: 0, valueA: 0, valueB: 0 }
  const averageValue = (valueA + valueB) / 2
  if (averageValue === 0) return { percentageDifference: 0, valueA: valueA, valueB: valueB }
  const difference = Math.abs(valueA - valueB)
  const percentageDiff = (difference / averageValue) * 100
  return { percentageDifference: parseFloat(percentageDiff.toFixed(2)), valueA, valueB }
})

function findBalancingPlayerValueInternal(currentValueSideA, currentValueSideB, BPV) {
  if (BPV === null || !isFinite(BPV) || BPV <= 0) return 0
  const targetValue = Math.max(currentValueSideA, currentValueSideB)
  const deficitSideValue = Math.min(currentValueSideA, currentValueSideB)
  let valueDifference = targetValue - deficitSideValue
  if (valueDifference < 0.01) return 0
  let estimatedRawValue = valueDifference,
    low = 0,
    high = estimatedRawValue * 5
  for (let i = 0; i < 50; i++) {
    let mid = (low + high) / 2
    let calculatedValueOfAddedPlayer = calculateTradeValueInternal([mid], BPV)
    let newDeficitSideValue = deficitSideValue + calculatedValueOfAddedPlayer
    if (Math.abs(newDeficitSideValue - targetValue) < 0.1) {
      estimatedRawValue = mid
      break
    } else if (newDeficitSideValue < targetValue) low = mid
    else high = mid
    estimatedRawValue = mid
  }
  return Math.max(0, estimatedRawValue)
}

const balancingPlayerValue = computed(() => {
  const valueA = totalValueSideA.value
  const valueB = totalValueSideB.value
  if (tradeBpv_value === null || !isFinite(tradeBpv_value) || tradeBpv_value <= 0) return 0
  return findBalancingPlayerValueInternal(valueA, valueB, tradeBpv_value)
})

function findClosestPlayersInternal(
  balancingRawValue,
  playersData,
  valueKey,
  selPlayers1,
  selPlayers2
) {
  const selectedPlayerNames = [
    ...selPlayers1.map((p) => p.player_full_name),
    ...selPlayers2.map((p) => p.player_full_name)
  ]
  const highestSelectedValue = Math.max(
    ...selPlayers1.map((p) => p[valueKey] || 0),
    ...selPlayers2.map((p) => p[valueKey] || 0),
    0
  )
  const valueLimit = balancingRawValue !== 0 ? balancingRawValue : highestSelectedValue
  const filteredPlayers = playersData.filter(
    (p) => !selectedPlayerNames.includes(p.player_full_name) && p[valueKey] <= valueLimit
  )
  const sortedPlayers = filteredPlayers.sort(
    (a, b) => Math.abs(a[valueKey] - balancingRawValue) - Math.abs(b[valueKey] - balancingRawValue)
  )
  return sortedPlayers.slice(0, 20)
}

// NEW FUNCTION: Get all available assets from both selected managers for balancing suggestions
const getAvailableAssetsForBalancing = () => {
  const assets = []

  // Only proceed if both managers are selected
  if (!selectedTradeManagerA.value || !selectedTradeManagerB.value) {
    return assets
  }

  // Get all assets from both managers
  const allPositions = ['QB', 'RB', 'WR', 'TE', 'PICKS']

  // Team A assets
  allPositions.forEach((position) => {
    const positionAssets = getManagerAssetsByPosition(selectedTradeManagerA.value, position)
    assets.push(...positionAssets)
  })

  // Team B assets
  allPositions.forEach((position) => {
    const positionAssets = getManagerAssetsByPosition(selectedTradeManagerB.value, position)
    assets.push(...positionAssets)
  })

  return assets
}

// Convert roster asset to trade calculator format
const mapAssetToTradeFormat = (asset) => {
  return {
    player_full_name: asset.full_name,
    player_id: asset.sleeper_id,
    _position: asset.player_position,
    sf_value: asset.player_value,
    one_qb_value: Math.round(asset.player_value * 0.8), // Estimate 1QB value if not available
    team: asset.team,
    age: asset.age,
    ownerId: asset.user_id, // Add the ownerId to track asset ownership
    display_name: asset.display_name // Include manager display name for UI
  }
}

// REPLACE the addPlayerToTrade function to respect asset ownership
const addPlayerToTrade = (player) => {
  // Now determine side based on ownerId instead of value comparison
  const sideToAdd =
    player.ownerId === selectedTradeManagerA.value ? selectedPlayers1 : selectedPlayers2

  const isPick = player.player_full_name.match(/\b(2024|2025|2026|2027)\b/)
  const existingPlayer = sideToAdd.value.find(
    (p) => !isPick && p.player_full_name === player.player_full_name
  )

  if (!existingPlayer || isPick) {
    sideToAdd.value.push(player)
    const teamLabel = player.ownerId === selectedTradeManagerA.value ? 'A' : 'B'
    message.success(
      `Added ${player.player_full_name} to Team ${teamLabel} (owner: ${player.display_name})`
    )
  } else {
    message.warning(`${player.player_full_name} is already in the trade.`)
  }
}

// Update the UI for the balance section to show ownership indicators
const closestBalancingPlayers = computed(() => {
  if (selectedPlayers1.value.length === 0 && selectedPlayers2.value.length === 0) return []
  const balRawValue = balancingPlayerValue.value
  // If balRawValue is 0, the trade is fair or the value to balance is negligible, so no suggestions needed.
  if (balRawValue < 1) return [] // Use a small threshold to account for floating point issues

  const valueKey = tradeState.checked1 ? 'sf_value' : 'one_qb_value'
  let losingManagerId = null

  if (totalValueSideA.value < totalValueSideB.value) {
    if (selectedTradeManagerA.value) {
      losingManagerId = selectedTradeManagerA.value
    } else {
      // Team A is losing, but its manager isn't selected. Cannot suggest players.
      return []
    }
  } else if (totalValueSideB.value < totalValueSideA.value) {
    if (selectedTradeManagerB.value) {
      losingManagerId = selectedTradeManagerB.value
    } else {
      // Team B is losing, but its manager isn't selected. Cannot suggest players.
      return []
    }
  } else {
    // Trade is perfectly balanced or another edge case.
    return []
  }

  if (!losingManagerId) return [] // Safeguard

  const allPositions = ['QB', 'RB', 'WR', 'TE', 'PICKS']
  let rawAssetsFromLosingSide = []
  allPositions.forEach((position) => {
    // getManagerAssetsByPosition returns assets owned by losingManagerId
    // that are NOT already in selectedPlayers1 or selectedPlayers2.
    const positionAssets = getManagerAssetsByPosition(losingManagerId, position)
    rawAssetsFromLosingSide.push(...positionAssets)
  })

  // Map these raw assets to the format used by the balancing display logic.
  // This adds ownerId, display_name, and maps player_value to sf_value/one_qb_value.
  const availableAssetsFromLosingManager = rawAssetsFromLosingSide.map(mapAssetToTradeFormat)

  // Get already traded player identifiers for filtering
  const tradedPlayerIds = [
    ...selectedPlayers1.value.map((p) => p.player_id || p.sleeper_id),
    ...selectedPlayers2.value.map((p) => p.player_id || p.sleeper_id)
  ].filter((id) => id) // Filter out undefined/null IDs

  const tradedPickNames = [
    ...selectedPlayers1.value
      .filter((p) => !p.player_id && !p.sleeper_id)
      .map((p) => p.player_full_name || p.full_name),
    ...selectedPlayers2.value
      .filter((p) => !p.player_id && !p.sleeper_id)
      .map((p) => p.player_full_name || p.full_name)
  ].filter((name) => name) // Filter out undefined/null names

  // Filter candidate assets from the losing manager's available assets.
  // Candidates must:
  // 1. Have a positive value
  // 2. Be less than or equal to the raw balancing value
  // 3. Not already be in the trade (by ID or by name for picks)
  const candidateAssets = availableAssetsFromLosingManager.filter(
    (asset) =>
      asset[valueKey] > 0 &&
      asset[valueKey] <= balRawValue &&
      !tradedPlayerIds.includes(asset.player_id) &&
      !tradedPickNames.includes(asset.player_full_name)
  )

  // Sort candidates by how close their value is to the balRawValue.
  const sortedByProximity = candidateAssets.sort(
    (a, b) => Math.abs(a[valueKey] - balRawValue) - Math.abs(b[valueKey] - balRawValue)
  )

  // Take the top 20 closest matches and then sort them by their actual value, descending.
  const topMatches = sortedByProximity.slice(0, 20)
  topMatches.sort((a, b) => b[valueKey] - a[valueKey])

  return topMatches
})

const displayedBalancingPlayers = computed(() =>
  showAllBalancingPlayers.value
    ? closestBalancingPlayers.value
    : closestBalancingPlayers.value.slice(0, 6)
)
const toggleShowAllBalancingPlayers = () =>
  (showAllBalancingPlayers.value = !showAllBalancingPlayers.value)

const tradeStatusComputed = computed(() => {
  if (selectedPlayers1.value.length === 0 && selectedPlayers2.value.length === 0)
    return { message: 'Please select players', isFair: false, aFavored: false, bFavored: false }
  const percentageDifference = tradeAnalysisComputed.value.percentageDifference
  if (percentageDifference <= tradePercentThreshold.value)
    return { message: 'Fair Trade', isFair: true, aFavored: false, bFavored: false }
  const balValue = Math.round(balancingPlayerValue.value)
  if (totalValueSideA.value < totalValueSideB.value)
    return {
      message: `Team A favored; add ~${balValue.toLocaleString()} to balance.`,
      isFair: false,
      aFavored: true,
      bFavored: false
    }
  return {
    message: `Team B favored; add ~${balValue.toLocaleString()} to balance.`,
    isFair: false,
    aFavored: false,
    bFavored: true
  }
})

const isFairTrade = computed(() => tradeStatusComputed.value.isFair)
const aFavoredTrade = computed(() => tradeStatusComputed.value.aFavored)
const bFavoredTrade = computed(() => tradeStatusComputed.value.bFavored)

async function fetchTradeRanks() {
  if (tradeRanksData.value.length > 1 && tradeRanksData.value[0].player_id) {
    tradeDropDownHandleChange(tradeDropDownValue1.value)
    return
  }
  tradeIsLoading.value = true
  tradeTepCheck.value = false
  try {
    const response = await axios.get(`${API_URL}/trade_calculator`, {
      params: { platform: tradePlatform.value, rank_type: tradeRankType.value }
    })
    tradeRanksData.value = response.data
    tradeDropDownHandleChange(tradeDropDownValue1.value)
  } catch (error) {
    console.error('Error fetching trade ranks:', error)
    message.error('Failed to load player values for trade calculator.')
    tradeRanksData.value = []
    tradeBpv_value = null
  } finally {
    tradeIsLoading.value = false
  }
}

function getTradePositionColor(position) {
  const colors = {
    QB: 'rgb(39, 125, 161)',
    RB: 'rgb(144, 190, 109)',
    WR: 'rgb(67, 170, 139)',
    TE: 'rgb(249, 132, 74)',
    PICK: 'rgb(189, 195, 199)'
  }
  return colors[position?.toUpperCase()] || 'rgb(0, 0, 0, .00)'
}

watch(tradeRankType, (newVal) => {
  clearTradeCalculator()
  tradeRanksData.value = [{}]
  fetchTradeRanks()
})

watch(tradeRanksData, (newData) => {
  if (newData && newData.length > 0) {
    const updateSelected = (selectedList) =>
      selectedList.value.map(
        (selP) => newData.find((p) => p.player_full_name === selP.player_full_name) || selP
      )
    selectedPlayers1.value = updateSelected(selectedPlayers1)
    selectedPlayers2.value = updateSelected(selectedPlayers2)
  }
})

watch(
  () => tradeState.checked1,
  () => {
    tradeDropDownHandleChange(tradeDropDownValue1.value)
  }
)

watch(activeKey, (newValue) => {
  if (newValue === '6') {
    fetchTradeRanks()
    // Reset position visibility to ensure positions are shown by default
    showTradePositions.A = true
    showTradePositions.B = true
  }
})

// Manager selection handlers
const selectedTradeManagerA = ref(null)
const selectedTradeManagerB = ref(null)
const expandedTradePositions = reactive({
  A: { QB: false, RB: false, WR: false, TE: false, PICKS: false },
  B: { QB: false, RB: false, WR: false, TE: false, PICKS: false }
})

// Add this with other reactive states
const showTradePositions = reactive({
  A: true,
  B: true
})

// Add this function to toggle position visibility
const togglePositionsVisibility = (team) => {
  showTradePositions[team] = !showTradePositions[team]
}

const onTradeManagerAChange = (userId) => {
  // Clear selected players for Team A when manager changes
  selectedPlayers1.value = []

  selectedTradeManagerA.value = userId
  // Reset expanded position groups
  Object.keys(expandedTradePositions.A).forEach((key) => {
    expandedTradePositions.A[key] = false
  })
  // Ensure positions are visible when a manager is selected
  showTradePositions.A = true
}

const onTradeManagerBChange = (userId) => {
  // Clear selected players for Team B when manager changes
  selectedPlayers2.value = []

  selectedTradeManagerB.value = userId
  // Reset expanded position groups
  Object.keys(expandedTradePositions.B).forEach((key) => {
    expandedTradePositions.B[key] = false
  })
  // Ensure positions are visible when a manager is selected
  showTradePositions.B = true
}

// Position group toggle
const toggleTradePositionGroup = (team, position) => {
  if (team === 'A') {
    expandedTradePositions.A[position] = !expandedTradePositions.A[position]
  } else {
    expandedTradePositions.B[position] = !expandedTradePositions.B[position]
  }
}

// Check if position group is expanded
const isTradePositionExpanded = (team, position) => {
  return team === 'A' ? expandedTradePositions.A[position] : expandedTradePositions.B[position]
}

// Get manager assets by position
const getManagerAssetsByPosition = (managerId, position) => {
  if (!managerId) return []

  // Convert position to lowercase for PICKS comparison
  const posToCheck = position === 'PICKS' ? 'PICKS' : position

  // First get all assets for this manager and position
  const managerAssets = filteredData.value.filter(
    (asset) => asset.user_id === managerId && asset.player_position === posToCheck
  )

  // Then filter out assets that are already in either trade basket
  return managerAssets
    .filter((asset) => {
      // For non-pick assets, use sleeper_id to check uniqueness
      if (asset.player_position !== 'PICKS') {
        return !isAssetInEitherTrade(asset)
      }
      // For picks, we need to match by full_name since picks can be duplicated
      // But we still need to show all picks in the available list
      return true
    })
    .sort((a, b) => b.player_value - a.player_value)
}

// Enhanced helper function to check if an asset is in either trade basket
const isAssetInEitherTrade = (asset) => {
  return isAssetInTrade(asset, 1) || isAssetInTrade(asset, 2)
}

// Check if an asset is in the trade
const isAssetInTrade = (asset, team) => {
  const targetArray = team === 1 ? selectedPlayers1.value : selectedPlayers2.value

  // For non-pick assets, match by sleeper_id
  if (asset.player_position !== 'PICKS') {
    return targetArray.some((p) => p.sleeper_id === asset.sleeper_id)
  }

  // For picks, match by full name
  return targetArray.some((p) => p.player_position === 'PICKS' && p.full_name === asset.full_name)
}

// Add asset to trade
const addAssetToTrade = (asset, team) => {
  try {
    // Create a deep clone of the asset to avoid reactivity issues
    const assetCopy = JSON.parse(
      JSON.stringify({
        sleeper_id: asset.sleeper_id,
        player_full_name: asset.full_name,
        full_name: asset.full_name,
        team: asset.team,
        age: asset.age,
        player_position: asset.player_position,
        _position: asset.player_position,
        player_value: asset.player_value,
        sf_value: asset.player_value,
        one_qb_value: Math.round(asset.player_value * 0.8),
        user_id: asset.user_id,
        display_name: asset.display_name
      })
    )

    // Determine if this is a draft pick
    const isPick = asset.player_position === 'PICKS'

    // For non-picks, check if the asset is already in the trade
    if (!isPick && isAssetInTrade(asset, team)) {
      // If it exists, remove it (toggle behavior)
      const targetArray = team === 1 ? selectedPlayers1 : selectedPlayers2
      const existingIndex = targetArray.value.findIndex((p) => p.sleeper_id === asset.sleeper_id)

      if (existingIndex >= 0) {
        targetArray.value.splice(existingIndex, 1)
        message.info(`Removed ${asset.full_name} from Team ${team === 1 ? 'A' : 'B'}`)
      }
    } else {
      // Add the asset to the appropriate side
      if (team === 1) {
        selectedPlayers1.value = [...selectedPlayers1.value, assetCopy]
      } else {
        selectedPlayers2.value = [...selectedPlayers2.value, assetCopy]
      }

      message.success(`Added ${asset.full_name} to Team ${team === 1 ? 'A' : 'B'}`)
    }
  } catch (error) {
    console.error('Error in addAssetToTrade:', error)
    message.error('Failed to update trade assets. Please try again.')
  }
}

// Toggle all position groups for a team
const toggleAllPositionGroups = (team, expanded) => {
  const positions = ['QB', 'RB', 'WR', 'TE', 'PICKS']
  positions.forEach((position) => {
    if (team === 'A') {
      expandedTradePositions.A[position] = expanded
    } else {
      expandedTradePositions.B[position] = expanded
    }
  })
}

// Check if all positions are expanded for a team
const areAllPositionsExpanded = (team) => {
  const positions = ['QB', 'RB', 'WR', 'TE', 'PICKS']
  return positions.every((position) =>
    team === 'A' ? expandedTradePositions.A[position] : expandedTradePositions.B[position]
  )
}

// Get team tier based on overall rank
const getTeamTier = (manager) => {
  const rank = overallFilter.value === 'all' ? manager.total_rank : manager.starters_rank
  const totalTeams = summaryData.value.length

  if (rank <= totalTeams * 0.25) {
    return { tier: 'Elite', class: 'elite-tier' }
  } else if (rank <= totalTeams * 0.5) {
    return { tier: 'Strong', class: 'strong-tier' }
  } else if (rank <= totalTeams * 0.75) {
    return { tier: 'Average', class: 'average-tier' }
  } else {
    return { tier: 'Developing', class: 'developing-tier' }
  }
}

// Get position strength class for visual indicator
const getPositionStrengthClass = (manager, position) => {
  const rank = getPositionRank(manager, position)
  const totalTeams = summaryData.value.length

  if (rank <= totalTeams * 0.25) {
    return 'position-elite'
  } else if (rank <= totalTeams * 0.5) {
    return 'position-strong'
  } else if (rank <= totalTeams * 0.75) {
    return 'position-average'
  } else {
    return 'position-weak'
  }
}

// Get position rank for a manager
const getPositionRank = (manager, position) => {
  const positionKey = position.toLowerCase()
  const rankKey =
    overallFilter.value === 'all' ? `${positionKey}_rank` : `${positionKey}_starter_rank`
  return manager[rankKey] || 999
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
    padding: 0 100px;
  }
}

.text-center-margin-top-30 {
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
.data-controls-card {
  margin-bottom: 24px;
  background-color: var(--color-background-soft);
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

.manager-value-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text-color);
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
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

/* Managers Grid (used in multiple tabs) */
.managers-card {
  margin-bottom: 20px;
  background-color: var(--league-details-primary-card);
}

.managers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
  color: var(--primary-text-color);
}

/* Enhanced Manager Item Styling */
.manager-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 16px;
  background: var(--color-background-soft);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

:root.dark .manager-item {
  background: rgba(34, 34, 34, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.manager-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.manager-item:hover {
  background: var(--color-background);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary);
}

:root.dark .manager-item:hover {
  background: rgba(40, 40, 40, 0.95);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.manager-item:hover::before {
  opacity: 1;
}

.manager-item:active {
  transform: translateY(-2px) scale(1.01);
  transition: transform 0.1s ease;
}

.current-user {
  border: 2px solid #ffd700;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 223, 0, 0.08));
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
}

.current-user::before {
  background: linear-gradient(90deg, #ffd700, #ffed4e, #fff200);
  opacity: 1;
}

.selected-manager {
  border: 2px solid #1890ff;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.08));
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.2);
}

.selected-manager::before {
  background: linear-gradient(90deg, #1890ff, #40a9ff, #69c0ff);
  opacity: 1;
}

.manager-avatar {
  position: relative;
  margin-right: 10px;
}

.manager-rank {
  position: absolute;
  bottom: -3px;
  right: -3px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.manager-details {
  flex: 1;
  min-width: 0;
}

.manager-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text);
}

.manager-stats {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.position-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.position-badge {
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.qb-badge {
  background-color: rgba(39, 125, 161, 0.15);
  color: rgb(39, 125, 161);
}

.rb-badge {
  background-color: rgba(144, 190, 109, 0.15);
  color: rgb(144, 190, 109);
}

.wr-badge {
  background-color: rgba(67, 170, 139, 0.15);
  color: rgb(67, 170, 139);
}

.te-badge {
  background-color: rgba(249, 132, 74, 0.15);
  color: rgb(249, 132, 74);
}

/* Manager avatar for trade selectors */
.manager-avatar-small {
  margin-right: 8px;
}

.manager-name-option {
  font-size: 14px;
}
/* Charts & Visualizations */
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
  color: var(--primary-text-color);
  margin-top: 3px;
}

/* Heatmap Table (Desktop & Mobile) */
.table-section {
  display: flex;
  justify-content: center;
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

.highlighted-row td,
.manager-card-mobile.highlighted-row {
  font-weight: 600;
}

.expanded-row-content {
  padding: 12px 8px;
  background-color: var(--color-background-mute);
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
  background-color: var(--color-background-mute);
  max-width: 340px;
  background: 1px solid white;
  border: 1px solid var(--card-outline-reverse);
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

.position-qb {
  border-left: 3px solid rgb(25, 118, 210);
}

.position-rb {
  border-left: 3px solid rgb(144, 190, 109);
}

.position-wr {
  border-left: 3px solid rgb(76, 175, 80);
}

.position-te {
  border-left: 3px solid rgb(249, 132, 74);
}

.position-picks {
  border-left: 3px solid rgb(143, 145, 146);
}

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
}

.mid-value-asset::before {
  background-color: #bdbdbd;
}

/* Mobile Heatmap Specifics */
.heatmap-mobile-view {
  display: none;
}

.manager-card-mobile {
  background: rgba(136, 136, 136, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  margin-bottom: 12px;
  padding: 16px 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.manager-card-mobile::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.manager-card-mobile:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
  border-color: rgba(59, 130, 246, 0.3);
}

.manager-card-mobile:hover::before {
  opacity: 1;
}

.manager-card-mobile:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

.manager-info-line-mobile {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  position: relative;
}

.manager-info-line-mobile .ant-avatar {
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.manager-name-mobile {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-left: 12px;
  color: var(--primary-text-color);
  font-weight: 899;
}

.manager-stats-grid-mobile {
  font-size: 10px;
}

.manager-card-mobile-details-reused {
  margin-top: 16px;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(248, 250, 252, 0.5);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

/* Modern stats grid styling */
.manager-stats-grid-mobile .ant-tag {
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.manager-stats-grid-mobile .ant-tag:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* Primary value tag - larger and more prominent */
.manager-stats-grid-mobile .ant-col:first-child .ant-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 15px;
  font-weight: 700;
  padding: 8px 16px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.position-summary-item.active-position-summary {
  background-color: rgba(24, 144, 255, 0.08);
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
  .heatmap-desktop-view {
    display: none;
  }

  .heatmap-mobile-view {
    display: block;
  }

  .position-summary {
    flex-direction: column;
    gap: 8px;
    color: var(--color-background-mute);
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
    color: var(--primary-text-color);
    background: var(--color-background-mute);
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

/* Team Composition Tab (Team Cards) */
.team-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  border: 2px solid transparent;
  transition: border-color 0.4s ease;
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

/* Team Level Indicators */
.team-level-indicators {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px;
  border-radius: 8px 8px 0 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
}

.team-tier-badge {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.elite-tier {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: white;
}

.strong-tier {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: white;
}

.average-tier {
  background: linear-gradient(135deg, #fa8c16, #ffc53d);
  color: white;
}

.developing-tier {
  background: linear-gradient(135deg, #f5222d, #ff7875);
  color: white;
}

.position-strength-indicators {
  display: flex;
  gap: 4px;
}

.position-strength {
  font-size: 9px;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 3px;
  min-width: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.position-elite {
  background: rgba(82, 196, 26, 0.8);
  color: white;
}

.position-strong {
  background: rgba(24, 144, 255, 0.8);
  color: white;
}

.position-average {
  background: rgba(250, 140, 22, 0.8);
  color: white;
}

.position-weak {
  background: rgba(245, 34, 45, 0.8);
  color: white;
}

/* Team card states */
.selected-team {
  border: 2px solid #1890ff !important;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.3) !important;
  transform: translateY(-2px);
  transition: all 0.3s ease;
  position: relative;
}

.dimmed-team {
  opacity: 0.5;
  filter: grayscale(20%);
  transition: all 0.3s ease;
}

.elite-team {
  border-left: 4px solid #52c41a;
}

.strong-team {
  border-left: 4px solid #1890ff;
}

.average-team {
  border-left: 4px solid #fa8c16;
}

.developing-team {
  border-left: 4px solid #f5222d;
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
  padding-right: 5px;
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
}

.asset-name {
}

.asset-team {
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

/* Position Groups Tab */
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
  white-space: normal;
  word-wrap: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
}

.position-group-container {
  background-color: var(--color-background-mute);
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
  gap: 4px;
  cursor: pointer;
}

.player-value-display {
  font-weight: 500;
  white-space: nowrap;
  font-size: 11px;
}

.font-size-11 {
  font-size: 11px;
}

/* Enhanced Position Groups Layout */
.main-positions-row {
  margin-bottom: 24px;
}

.main-position-container {
  min-height: 500px;
}

.picks-row {
  margin-top: 16px;
}

.picks-container {
  background: linear-gradient(135deg, var(--color-background-soft), var(--color-background-mute));
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  min-height: auto;
}

.picks-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--color-primary);
}

.picks-count {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.picks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.pick-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  font-size: 13px;
  transition: all 0.2s ease;
  cursor: default;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.pick-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pick-name {
  flex: 1;
  font-weight: 500;
  margin-right: 12px;
}

.pick-value {
  font-weight: 600;
  color: var(--color-primary);
  margin-right: 12px;
  min-width: 60px;
  text-align: right;
}

.pick-owner {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 80px;
  text-align: right;
}

/* League Assets Tab */
.lighter {
  color: #aaa !important;
  opacity: 0.3;
}

.dimmed-text {
  color: #aaa !important;
  /* color: var(--league-details-primary-card) !important; */
}

/* League Assets Divider Lines */
.league-assets-divider {
  margin: 12px 0;
  padding: 0;
  list-style: none;
}

.divider-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff4d4f, transparent);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider-text {
  background: white;
  color: #ff4d4f;
  font-size: 11px;
  font-weight: bold;
  padding: 0 8px;
  border: 1px solid #ff4d4f;
  border-radius: 12px;
  white-space: nowrap;
}

/* Waivers Tab */

/* Modals (Info and Player Detail) */
.tab-info-container h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--text-color, #1890ff);
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
  flex-wrap: wrap;
  gap: 5px 10px;
  margin: 10px 0;
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
  background-color: rgb(25, 118, 210);
}

.legend-rb {
  background-color: rgb(144, 190, 109);
}

.legend-wr {
  background-color: rgb(76, 175, 80);
}

.legend-te {
  background-color: rgb(249, 132, 74);
}

/* Miscellaneous & Utility Styles */
.rank-logos {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
}

.manager-logos {
  width: 28px;
  height: 28px;
  vertical-align: middle;
  border-radius: 50%;
  border: 1px solid gray;
}

li {
  list-style-type: none;
}

/* ---------- TRADE CALCULATOR STYLES START ---------- */
.trade-calculator-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  contain: layout style;
}

.trade-teams {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  position: relative;
  z-index: 1;
}

@media (min-width: 992px) {
  .trade-teams {
    display: grid;
    grid-template-columns: 1fr min-content 1fr;
    gap: 8px;
    align-items: start;
  }

  .trade-evaluation {
    width: auto;
    padding: 0 12px;
    align-self: start;
    position: relative;
    z-index: 1;
  }

  .balance-visualizer-spacing {
    min-width: 280px;
  }
}

@media (max-width: 991px) {
  .trade-teams {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .trade-evaluation {
    order: 1;
    padding: 8px 0;
    margin: 0 auto;
    max-width: 350px;
    position: relative;
    z-index: 1;
  }
}

@media (max-width: 767px) {
  .trade-teams {
    display: grid;
    grid-template-areas:
      'teamA'
      'evaluation'
      'teamB';
    grid-template-rows: auto auto auto;
    position: relative;
    z-index: 1;
  }

  .team-card:nth-of-type(1) {
    grid-area: teamA;
  }

  .trade-evaluation {
    grid-area: evaluation;
    margin: 16px auto;
    width: 100%;
  }

  .team-card:nth-of-type(2) {
    grid-area: teamB;
  }
}

.team-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  border: 2px solid transparent;
  transition: border-color 0.4s ease;
}

.team-card.card-outline-balanced {
  border-color: rgba(82, 196, 26, 0.5);
}

.team-card.card-outline-winning {
  border-color: rgba(24, 144, 255, 0.5);
}

.team-card.card-outline-losing {
  border-color: rgba(245, 34, 45, 0.4);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.team-value {
  font-size: 18px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 16px;
  background-color: #f0f2f5;
  min-width: 50px;
  text-align: right;
}

.value-favorable {
  color: #52c41a;
  background-color: rgba(82, 196, 26, 0.1);
}

.value-balanced {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

.players-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 10px;
  flex-grow: 1;
}

.player-card {
  margin-bottom: 8px;
}

.player-item {
  border-radius: 4px;
  background-color: var(--color-background-mute, #fff);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.player-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.player-details-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
}

.player-name-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.player-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  color: var(--primary-text-color);
  line-height: 1.2;
}

.player-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-position {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1;
}

.player-age {
  font-size: 11px;
  color: #8c8c8c;
  line-height: 1;
}

.player-value-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-value {
  font-size: 16px;
  font-weight: 700;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.remove-player {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.adjustment-card {
  margin-top: 8px;
}

.va-card {
  background-color: rgba(24, 144, 255, 0.05);
  border-color: rgba(24, 144, 255, 0.2);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 8px;
}

.asset-count {
  font-size: 14px;
  color: #5c5f6b;
}

.total-value-display {
  font-size: 14px;
  color: #2d3142;
}

.manager-selector-container {
  margin-bottom: 12px;
}

.trade-evaluation {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* Remove padding to prevent extra space */
  width: 100%;
  max-width: 100%;
  /* align-items: start; */
}

.balance-visualizer-spacing {
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 992px) {
  .trade-teams {
    display: grid;
    grid-template-columns: 1fr min-content 1fr;
    gap: 8px;
    align-items: start; /* Changed from center to start */
  }

  .trade-evaluation {
    width: auto;
    padding: 0 12px;
    align-self: start; /* Changed from center to start to align this item to the top of its grid cell */
  }

  .balance-visualizer-spacing {
    min-width: 280px; /* Ensure consistent width */
  }
}

@media (max-width: 991px) {
  .trade-teams {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .trade-evaluation {
    order: 1; /* Place between Team A and Team B */
    padding: 8px 0;
    margin: 0 auto;
    max-width: 350px;
  }
}

@media (max-width: 767px) {
  .trade-teams {
    display: grid;
    grid-template-areas:
      'teamA'
      'evaluation'
      'teamB';
    grid-template-rows: auto auto auto;
  }

  .team-card:nth-of-type(1) {
    grid-area: teamA;
  }

  .trade-evaluation {
    grid-area: evaluation;
    margin: 16px auto;
    width: 100%;
  }

  .team-card:nth-of-type(2) {
    grid-area: teamB;
  }
}

.balancing-players-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}

.balancing-title {
  display: flex;
  align-items: center;
}

.balancing-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.balancing-players-container {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.balancing-player-card {
  margin-bottom: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.balancing-player-card:hover {
  transform: translateY(-2px);
}

.add-player-icon {
  font-size: 16px;
}

.view-more {
  text-align: center;
  margin-top: 16px;
}

.trade-controls-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slider-label {
  font-size: 14px;
  color: #5c5f6b;
  font-weight: 500;
}

.clear-button-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.tab-sub-header {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-color);
}

/* Owner Badge */
.owner-badge {
  margin-left: 8px;
  font-size: 10px;
  padding: 0 4px;
  line-height: 1.2;
  border-radius: 10px;
  vertical-align: middle;
}

/* Trade Position Group Enhancements */
.trade-position-group {
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.trade-position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--color-background-soft, #f9f9f9);
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--primary-text-color, #333);
}

.trade-position-header:hover {
  background-color: #f0f0f0;
}

.trade-position-title {
  font-weight: 500;
}

.trade-position-count {
  background-color: var(--color-background-mute);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.trade-position-expand-icon {
  margin-left: 8px;
}

.trade-position-assets {
  padding: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.trade-asset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.trade-asset-item:hover {
  background-color: rgba(24, 144, 255, 0.1);
}

.trade-asset-item.asset-in-trade {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.trade-asset-details {
  flex: 1;
  min-width: 0;
}

.trade-asset-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trade-asset-meta {
  display: flex;
  font-size: 12px;
  color: #888;
  gap: 6px;
}

.trade-asset-team {
  white-space: nowrap;
}

.trade-asset-age {
  white-space: nowrap;
}

.trade-asset-value {
  font-weight: 500;
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Header colors for position groups */
.trade-position-header-qb {
  border-left: 4px solid rgb(39, 125, 161);
}

.trade-position-header-rb {
  border-left: 4px solid rgb(144, 190, 109);
}

.trade-position-header-wr {
  border-left: 4px solid rgb(67, 170, 139);
}

.trade-position-header-te {
  border-left: 4px solid rgb(249, 132, 74);
}

.trade-position-header-picks {
  border-left: 4px solid rgb(70, 70, 70);
}

.position-toggle-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.position-toggle-buttons {
  display: flex;
  gap: 8px;
}

/* About Site Section - Theme Responsive */
.about-site-section {
  margin-bottom: 24px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 18px 20px;
  color: var(--color-text);
}

.about-site-title {
  font-size: 1.5em;
  margin-bottom: 8px;
  color: var(--color-text);
  font-weight: 600;
}

.about-site-section p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}
</style>
