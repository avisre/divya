package com.divya.android.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold

@Composable
fun PujaVideoCard(
    streamUrl: String?,
    shareUrl: String?,
    onVideoStarted: () -> Unit,
) {
    val context = LocalContext.current
    var playerReady by remember { mutableStateOf(false) }
    var playbackStarted by remember { mutableStateOf(false) }
    val player = remember(streamUrl) {
        streamUrl?.let {
            ExoPlayer.Builder(context).build().apply {
                setMediaItem(MediaItem.fromUri(it))
                prepare()
            }
        }
    }

    DisposableEffect(player) {
        if (player == null) {
            onDispose { }
        } else {
            val listener = object : Player.Listener {
                override fun onPlaybackStateChanged(playbackState: Int) {
                    playerReady = playbackState == Player.STATE_READY
                }

                override fun onIsPlayingChanged(isPlaying: Boolean) {
                    if (isPlaying && !playbackStarted) {
                        playbackStarted = true
                        onVideoStarted()
                    }
                }
            }
            player.addListener(listener)
            onDispose {
                player.removeListener(listener)
                player.release()
            }
        }
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Ivory.copy(alpha = 0.96f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    text = "Sacred video archive",
                    style = MaterialTheme.typography.titleLarge,
                    color = Saffron,
                )
                Text(
                    text = if (streamUrl != null) "Mongo video ready" else "Awaiting upload",
                    style = MaterialTheme.typography.labelLarge,
                    color = TempleGold,
                )
            }
            if (player != null) {
                AndroidView(
                    factory = { viewContext ->
                        PlayerView(viewContext).apply {
                            useController = true
                            this.player = player
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(
                        onClick = {
                            if (player.isPlaying) player.pause() else player.play()
                        },
                        enabled = playerReady,
                        modifier = Modifier.weight(1f),
                    ) {
                        Text(if (player.isPlaying) "Pause" else "Play")
                    }
                    OutlinedButton(
                        onClick = {
                            if (!shareUrl.isNullOrBlank()) {
                                context.startActivity(
                                    Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_TEXT, shareUrl)
                                    },
                                )
                            }
                        },
                        enabled = !shareUrl.isNullOrBlank(),
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Share link")
                    }
                }
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "Private puja recording will appear here when the temple uploads it.",
                        style = MaterialTheme.typography.titleMedium,
                        color = DeepBrown,
                    )
                }
            }
            if (!shareUrl.isNullOrBlank()) {
                OutlinedButton(
                    onClick = {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(shareUrl)))
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Open browser share page")
                }
            }
        }
    }
}
