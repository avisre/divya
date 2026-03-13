package com.divya.android.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.VisualTransformation
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory

private val FieldIdleBorder = Color(0xFFE8D5C4)
private val FieldFocusedBorder = Color(0xFFC84B0C)

@Composable
fun ProductionOutlinedTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    singleLine: Boolean = false,
    minLines: Int = 1,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()
    val borderColor by animateColorAsState(
        targetValue = if (isFocused) FieldFocusedBorder else FieldIdleBorder,
        animationSpec = tween(durationMillis = 200),
        label = "outlined_field_border",
    )

    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier,
        label = { Text(label) },
        interactionSource = interactionSource,
        keyboardOptions = keyboardOptions,
        visualTransformation = visualTransformation,
        singleLine = singleLine,
        minLines = minLines,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = borderColor,
            unfocusedBorderColor = borderColor,
            focusedContainerColor = Ivory.copy(alpha = 0.92f),
            unfocusedContainerColor = Ivory.copy(alpha = 0.92f),
            focusedLabelColor = FieldFocusedBorder,
            unfocusedLabelColor = DeepBrown.copy(alpha = 0.7f),
            cursorColor = FieldFocusedBorder,
            focusedTextColor = DeepBrown,
            unfocusedTextColor = DeepBrown,
        ),
    )
}
