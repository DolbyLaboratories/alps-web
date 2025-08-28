/************************************************************************************************************
 *                Copyright (C) 2023-2024 by Dolby International AB.
 *                All rights reserved.

 * Redistribution and use in source and binary forms, with or without modification, are permitted
 * provided that the following conditions are met:

 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions
 *    and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions
 *    and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or
 *    promote products derived from this software without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 ************************************************************************************************************/

/**
 * @module
 * @desc  Parse AC-4 frames, specifically the TOC. The code was generated automatically.
 */

export class ParseError extends Error {}

export class Parser
{
    // Class field declarations
    v = null;
    content_classifier = null;
    i = null;
    frame_rate_factor = null;
    bk_substream_index = null;
    a_substream_indices = null;
    last_referenced_substream = null;
    referenced_substreams = null;
    protection_bits_primary_bits = null;
    protection_bits_secondary_bits = null;
    toc_i = null;
    OAMD_OBJECT_TYPE_BED = null;
    OAMD_OBJECT_TYPE_ISF = null;
    OAMD_OBJECT_TYPE_DYNAMIC = null;
    OAMD_OBJECT_TYPE_RESERVED = null;
    toc_j = null;
    vb = null;
    presentation_to_groups = null;
    group_frame_rate_factor = null;
    b_hsf_ext = null;
    b_single_substream = null;
    n_bed_objects = null;
    a_num_bed_objects = null;
    b_bed_objects_prev = null;
    num_lfe = null;
    n = null;
    n_skip_bytes = null;
    b_more_skip_bytes = null;
    n_bits_read_0 = null;
    n_bits_read_1 = null;
    n_bits_read = null;
    n_skip_bits = null;
    reserved = null;
    padding = null;
    CHANNEL_MODE_MONO = null;
    CHANNEL_MODE_STEREO = null;
    CHANNEL_MODE_30 = null;
    CHANNEL_MODE_50 = null;
    CHANNEL_MODE_51 = null;
    CHANNEL_MODE_70_34 = null;
    CHANNEL_MODE_71_34 = null;
    CHANNEL_MODE_70_52 = null;
    CHANNEL_MODE_71_52 = null;
    CHANNEL_MODE_70_322 = null;
    CHANNEL_MODE_71_322 = null;
    CHANNEL_MODE_704 = null;
    CHANNEL_MODE_714 = null;
    CHANNEL_MODE_904 = null;
    CHANNEL_MODE_914 = null;
    CHANNEL_MODE_222 = null;
    presentation_config = null;
    presentation_version = null;
    b_add_emdf_substreams = null;
    presentation_level = null;
    b_presentation_id = null;
    presentation_id = null;
    b_pre_virtualized = null;
    n_add_emdf_substreams = null;
    pi_i = null;
    b_single_substream_group = null;
    b_presentation_filter = null;
    b_enable_presentation = null;
    n_substream_groups = null;
    b_multi_pid = null;
    n_substream_groups_minus2 = null;
    sg = null;
    bitstream_version = null;
    fs_index = null;
    frame_rate_index = null;
    BAM_g_position = 0;
    BAM_g_table0 = [0, 2, 4, 6];
    BAM_g_table1 = [252, 253, 508, 509];
    BAM_g_table2 = [122, 123, 124, 125];
    BAM_g_table3 = [252, 253, 508, 509];
    BAM_g_table4 = [4, 6, 8, 10, 12, 14];
    BAM_g_table5 = [122, 123, 124, 125];
    BAM_g_table6 = [0, 0];
    BAM_g_table7 = [0, 1, 2, 3, 5, 0, 0, 0];
    BAM_g_table8 = [2, 3, 6, 8, 10, 8, 10, 12];
    BAM_g_table9 = [2, 1, 1, 2, 2, 2, 2, 2, 2, 1];
    BAM_g_table10 = [4, 8, 10, 14, 15, 30, -1, -1];
    BAM_g_table11 = [2, 3, 4, 5, 6, 7];
    BAM_g_table12 = [2, 1, 1, 2, 2, 2, 2, 2, 2, 1];
    BAM_g_table13 = [1920, 1920, 2048, 1536, 1536, 960, 960, 1024, 768, 768, 512, 384, 384, 2048];
    BAM_g_table14 = [2, 3, 4];
    BAM_g_table15 = {0: 2, 1: 4};
    BAM_g_table16 = [0, 1, 7, 8, 9];
    BAM_g_table17 = {0: 1, 1: 2};
    BAM_g_table18 = [5, 6, 7, 8, 9];
    BAM_g_table19 = [10, 11, 12];

    constructor (BAM_source, BAM_sink)
    {
        this.BAM_source = BAM_source;
        this.BAM_sink = BAM_sink;
    }

    F_channel_mode_contains_LFE (cm)
    {
        {
            if (cm == this.CHANNEL_MODE_51 || cm == this.CHANNEL_MODE_71_34 || cm == this.CHANNEL_MODE_71_52 || cm == this.CHANNEL_MODE_71_322)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        }
    }

    F_bitrate_indicator ()
    {
        var bi;
        var factor;
        {
            {
                bi = this.BAM_source.get("", 3);
                this.BAM_g_position += 3;
            }
            if ((this.BAM_g_table0.slice(0).indexOf(bi) >= 0))
            {
                {
                    bi = bi >> 1;
                }
            }
            else
            {
                {
                    {
                        this.v = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    {
                        this.v = (bi << 2) + this.v;
                    }
                    {
                        factor = Math.floor(this.v / 8);
                    }
                    {
                        bi = this.v - factor * 4;
                    }
                }
            }
        }
    }

    F_content_type ()
    {
        var b_serialized_language_tag;
        var n_language_tag_bytes;
        var language_tag_chunk;
        var language_tag_bytes;
        var b_language_indicator;
        var b_start_tag;
        {
            {
                this.content_classifier = this.BAM_source.get("", 3);
                this.BAM_g_position += 3;
            }
            {
                b_language_indicator = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_language_indicator)
            {
                {
                    {
                        b_serialized_language_tag = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_serialized_language_tag)
                    {
                        {
                            {
                                b_start_tag = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            {
                                language_tag_chunk = this.BAM_source.get("", 16);
                                this.BAM_g_position += 16;
                            }
                        }
                    }
                    else
                    {
                        {
                            {
                                n_language_tag_bytes = this.BAM_source.get("", 6);
                                this.BAM_g_position += 6;
                            }
                            for (this.i = 0; this.i < n_language_tag_bytes; this.i++)
                            {
                                {
                                    language_tag_bytes = this.BAM_source.get("", 8);
                                    this.BAM_g_position += 8;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    F_ac4_substream_info_chan (asio_group_index, asio_gs_index, asio_b_substreams_present_chan)
    {
        var substream_index;
        var b_sf_multiplier;
        var b_bitrate_info;
        var si_ch_mode;
        var si_channel_mode;
        var top_channels_present;
        var b_4_back_channels_present;
        var si_b_iframe;
        var b_center_present;
        var b_lfe = null;
        var b_lfe;
        var sf_multiplier;
        var add_ch_base;
        {
            {
                this.F_define_channel_modes();
            }
            {
                this.F_define_oamd();
            }
            {
                si_channel_mode = this.F_channel_mode();
                if (si_channel_mode == null)
                {
                    throw ParseError("F_channel_mode", "expected to return a value, returned None");
                }
            }
            if (si_channel_mode == 511)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        si_channel_mode += this.v;
                    }
                }
            }
            if ((this.BAM_g_table1.slice(0).indexOf(si_channel_mode) >= 0))
            {
                {
                    {
                        b_4_back_channels_present = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    {
                        b_center_present = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    {
                        top_channels_present = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                }
            }
            if (this.fs_index == 1)
            {
                {
                    {
                        b_sf_multiplier = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_sf_multiplier)
                    {
                        {
                            sf_multiplier = this.BAM_source.get("", 1);
                            this.BAM_g_position += 1;
                        }
                    }
                }
            }
            {
                b_bitrate_info = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_bitrate_info)
            {
                {
                    this.F_bitrate_indicator();
                }
            }
            if ((this.BAM_g_table2.slice(0).indexOf(si_channel_mode) >= 0))
            {
                {
                    add_ch_base = this.BAM_source.get("", 1);
                    this.BAM_g_position += 1;
                }
            }
            {
                this.frame_rate_factor = this.group_frame_rate_factor[asio_group_index];
            }
            for (this.i = 0; this.i < this.frame_rate_factor; this.i++)
            {
                {
                    si_b_iframe = this.BAM_source.get("", 1);
                    this.BAM_g_position += 1;
                }
            }
            if (asio_b_substreams_present_chan == 1)
            {
                {
                    {
                        substream_index = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    if (substream_index == 3)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                substream_index += this.v;
                            }
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        substream_index = this.bk_substream_index;
                    }
                    {
                        this.bk_substream_index = this.bk_substream_index + 1;
                    }
                }
            }
            {
                this.a_substream_indices.push(substream_index);
            }
            for (this.i = 0; this.i < this.frame_rate_factor; this.i++)
            {
                {
                    if (asio_b_substreams_present_chan == 1)
                    {
                        {
                            {
                                this.last_referenced_substream = Math.max(this.last_referenced_substream, substream_index + this.i);
                            }
                            {
                                this.referenced_substreams.push(substream_index + this.i);
                            }
                        }
                    }
                    if ((this.BAM_g_table3.slice(0).indexOf(si_channel_mode) >= 0))
                    {
                    }
                    {
                        si_ch_mode = this.F_get_ch_mode(si_channel_mode);
                        if (si_ch_mode == null)
                        {
                            throw ParseError("F_get_ch_mode", "expected to return a value, returned None");
                        }
                    }
                    if ((this.BAM_g_table4.slice(0).indexOf(si_ch_mode) >= 0))
                    {
                        {
                            if (b_lfe == null)
                            {
                                b_lfe = new Array((substream_index + this.i) + 1).fill(0);
                            }
                            else if ((b_lfe).length <= substream_index + this.i)
                            {
                                b_lfe.push.apply(b_lfe, new Array((substream_index + this.i) - (b_lfe).length + 1).fill(0));
                            }
                            b_lfe[substream_index + this.i] = 1;
                        }
                    }
                    else
                    {
                        {
                            if (b_lfe == null)
                            {
                                b_lfe = new Array((substream_index + this.i) + 1).fill(0);
                            }
                            else if ((b_lfe).length <= substream_index + this.i)
                            {
                                b_lfe.push.apply(b_lfe, new Array((substream_index + this.i) - (b_lfe).length + 1).fill(0));
                            }
                            b_lfe[substream_index + this.i] = 0;
                        }
                    }
                }
            }
        }
    }

    F_channel_mode ()
    {
        var value;
        var stereo_channel_mode;
        {
            {
                value = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (value == 1)
            {
                {
                    {
                        this.v = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    {
                        value = (value << 1) + this.v;
                    }
                    {
                        stereo_channel_mode = 2;
                    }
                    if (value == 3)
                    {
                        {
                            {
                                this.v = this.BAM_source.get("", 2);
                                this.BAM_g_position += 2;
                            }
                            {
                                value = (value << 2) + this.v;
                            }
                            if (value == 15)
                            {
                                {
                                    {
                                        this.v = this.BAM_source.get("", 3);
                                        this.BAM_g_position += 3;
                                    }
                                    {
                                        value = (value << 3) + this.v;
                                    }
                                    if (value == 120 || value == 121)
                                    {
                                        {
                                            {
                                                stereo_channel_mode = value;
                                            }
                                            {
                                                value = 2;
                                            }
                                        }
                                    }
                                    if (value == 126)
                                    {
                                        {
                                            {
                                                this.v = this.BAM_source.get("", 1);
                                                this.BAM_g_position += 1;
                                            }
                                            {
                                                value = (value << 1) + this.v;
                                            }
                                        }
                                    }
                                    if (value == 127)
                                    {
                                        {
                                            {
                                                this.v = this.BAM_source.get("", 2);
                                                this.BAM_g_position += 2;
                                            }
                                            {
                                                value = (value << 2) + this.v;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return value;
        }
    }

    F_ac4_substream_info (si_b_associated, si_b_dialog, si_ps_index)
    {
        var substream_index;
        var si_b_iframe;
        var b_sf_multiplier;
        var b_bitrate_info;
        var b_dialog_content;
        var si_channel_mode;
        var b_lfe = null;
        var b_lfe;
        var sf_multiplier;
        var add_ch_base;
        var b_associated_content;
        var b_content_type;
        {
            {
                this.F_define_channel_modes();
            }
            {
                si_channel_mode = this.F_channel_mode();
                if (si_channel_mode == null)
                {
                    throw ParseError("F_channel_mode", "expected to return a value, returned None");
                }
            }
            if (si_channel_mode == 511)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        si_channel_mode += this.v;
                    }
                }
            }
            if (this.fs_index == 1)
            {
                {
                    {
                        b_sf_multiplier = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_sf_multiplier)
                    {
                        {
                            sf_multiplier = this.BAM_source.get("", 1);
                            this.BAM_g_position += 1;
                        }
                    }
                }
            }
            {
                b_bitrate_info = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_bitrate_info)
            {
                {
                    this.F_bitrate_indicator();
                }
            }
            if ((this.BAM_g_table5.slice(0).indexOf(si_channel_mode) >= 0))
            {
                {
                    add_ch_base = this.BAM_source.get("", 1);
                    this.BAM_g_position += 1;
                }
            }
            {
                b_content_type = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_content_type)
            {
                {
                    {
                        this.F_content_type();
                    }
                    if ((this.content_classifier) == (0))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (1))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (2))
                    {
                        {
                            {
                                b_associated_content = 1;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (3))
                    {
                        {
                            {
                                b_associated_content = 1;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (4))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 1;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (5))
                    {
                        {
                            {
                                b_associated_content = 1;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (6))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (7))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        b_associated_content = 0;
                    }
                    {
                        b_dialog_content = 0;
                    }
                }
            }
            for (this.i = 0; this.i < this.frame_rate_factor; this.i++)
            {
                {
                    si_b_iframe = this.BAM_source.get("", 1);
                    this.BAM_g_position += 1;
                }
            }
            {
                substream_index = this.BAM_source.get("", 2);
                this.BAM_g_position += 2;
            }
            if (substream_index == 3)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        substream_index += this.v;
                    }
                }
            }
            {
                this.a_substream_indices.push(substream_index);
            }
            for (this.i = 0; this.i < this.frame_rate_factor; this.i++)
            {
                {
                    {
                        this.last_referenced_substream = Math.max(this.last_referenced_substream, substream_index + this.i);
                    }
                    {
                        this.referenced_substreams.push(substream_index + this.i);
                    }
                    {
                        if (b_lfe == null)
                        {
                            b_lfe = new Array((substream_index + 1) + 1).fill(0);
                        }
                        else if ((b_lfe).length <= substream_index + 1)
                        {
                            b_lfe.push.apply(b_lfe, new Array((substream_index + 1) - (b_lfe).length + 1).fill(0));
                        }
                        b_lfe[substream_index + 1] = this.F_channel_mode_contains_LFE(si_channel_mode);
                        if (b_lfe[substream_index + 1] == null)
                        {
                            throw ParseError("F_channel_mode_contains_LFE", "expected to return a value, returned None");
                        }
                    }
                }
            }
        }
    }

    F_emdf_protection ()
    {
        var protection_bits_secondary;
        var protection_length_secondary;
        var protection_length_primary;
        var protection_bits_primary;
        {
            {
                protection_length_primary = this.BAM_source.get("", 2);
                this.BAM_g_position += 2;
            }
            {
                protection_length_secondary = this.BAM_source.get("", 2);
                this.BAM_g_position += 2;
            }
            if ((protection_length_primary) == (0))
            {
                if (1)
                {
                    throw "protection_length_primary == 0 is reserved";
                }
            }
            else if ((protection_length_primary) == (1))
            {
                {
                    this.protection_bits_primary_bits = 8;
                }
            }
            else if ((protection_length_primary) == (2))
            {
                {
                    this.protection_bits_primary_bits = 32;
                }
            }
            else if ((protection_length_primary) == (3))
            {
                {
                    this.protection_bits_primary_bits = 128;
                }
            }
            {
                protection_bits_primary = this.BAM_source.get("", this.protection_bits_primary_bits);
                this.BAM_g_position += this.protection_bits_primary_bits;
            }
            if ((protection_length_secondary) == (0))
            {
                {
                    this.protection_bits_secondary_bits = 0;
                }
            }
            else if ((protection_length_secondary) == (1))
            {
                {
                    this.protection_bits_secondary_bits = 8;
                }
            }
            else if ((protection_length_secondary) == (2))
            {
                {
                    this.protection_bits_secondary_bits = 32;
                }
            }
            else if ((protection_length_secondary) == (3))
            {
                {
                    this.protection_bits_secondary_bits = 128;
                }
            }
            {
                protection_bits_secondary = this.BAM_source.get("", this.protection_bits_secondary_bits);
                this.BAM_g_position += this.protection_bits_secondary_bits;
            }
        }
    }

    F_emdf_info ()
    {
        var key_id;
        var b_emdf_payloads_substream_info;
        var emdf_version;
        {
            {
                emdf_version = this.BAM_source.get("", 2);
                this.BAM_g_position += 2;
            }
            if (emdf_version == 3)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        emdf_version += this.v;
                    }
                }
            }
            {
                key_id = this.BAM_source.get("", 3);
                this.BAM_g_position += 3;
            }
            if (key_id == 7)
            {
                {
                    {
                        this.v = this.F_variable_bits(3);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        key_id += this.v;
                    }
                }
            }
            {
                b_emdf_payloads_substream_info = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_emdf_payloads_substream_info)
            {
                {
                    this.F_emdf_payloads_substream_info(this.toc_i);
                }
            }
            {
                this.F_emdf_protection();
            }
        }
    }

    F_emdf_payloads_substream_info (toc_i)
    {
        var substream_index;
        {
            {
                substream_index = this.BAM_source.get("", 2);
                this.BAM_g_position += 2;
            }
            if (substream_index == 3)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        substream_index += this.v;
                    }
                }
            }
            {
                this.last_referenced_substream = Math.max(this.last_referenced_substream, substream_index);
            }
            {
                this.referenced_substreams.push(substream_index);
            }
            {
                this.a_substream_indices.push(substream_index);
            }
        }
    }

    F_ac4_hsf_ext_substream_info (ahsf_b_substreams_present)
    {
        var substream_index;
        {
            if (ahsf_b_substreams_present == 1)
            {
                {
                    {
                        substream_index = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    if (substream_index == 3)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                substream_index += this.v;
                            }
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        substream_index = this.bk_substream_index;
                    }
                    {
                        this.bk_substream_index = this.bk_substream_index + 1;
                    }
                }
            }
            if (ahsf_b_substreams_present == 1)
            {
                {
                    {
                        this.last_referenced_substream = Math.max(this.last_referenced_substream, substream_index);
                    }
                    {
                        this.referenced_substreams.push(substream_index);
                    }
                }
            }
        }
    }

    F_oamd_common_data ()
    {
        var add_data_bits;
        var ocd_p1;
        var add_data;
        var ocd_p0;
        var bits_used;
        var b_bed_object_chan_distribute;
        var master_screen_size_ratio;
        var add_data_bytes_minus1;
        var add_data_bytes;
        var b_additional_data;
        var b_default_screen_size_ratio;
        {
            {
                b_default_screen_size_ratio = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_default_screen_size_ratio == 0)
            {
                {
                    master_screen_size_ratio = this.BAM_source.get("", 5);
                    this.BAM_g_position += 5;
                }
            }
            {
                b_bed_object_chan_distribute = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                b_additional_data = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_additional_data)
            {
                {
                    {
                        add_data_bytes_minus1 = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    {
                        add_data_bytes = add_data_bytes_minus1 + 1;
                    }
                    if (add_data_bytes == 2)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                add_data_bytes += this.v;
                            }
                        }
                    }
                    {
                        add_data_bits = add_data_bytes * 8;
                    }
                    {
                        ocd_p0 = this.BAM_g_position;
                    }
                    {
                        ocd_p1 = this.BAM_g_position;
                    }
                    {
                        bits_used = ocd_p1 - ocd_p0;
                    }
                    {
                        add_data_bits = add_data_bits - bits_used;
                    }
                    if (add_data_bits < 0)
                    {
                        throw "Wrong add_data_bytes_minus1 size indication";
                    }
                    {
                        add_data = this.BAM_source.get("", add_data_bits);
                        this.BAM_g_position += add_data_bits;
                    }
                }
            }
        }
    }

    F_define_oamd ()
    {
        var NUM_TRIM_CONFIGS;
        {
            {
                this.OAMD_OBJECT_TYPE_BED = 0;
            }
            {
                this.OAMD_OBJECT_TYPE_ISF = 1;
            }
            {
                this.OAMD_OBJECT_TYPE_DYNAMIC = 2;
            }
            {
                this.OAMD_OBJECT_TYPE_RESERVED = 3;
            }
            {
                NUM_TRIM_CONFIGS = 9;
            }
        }
    }

    F_ac4_substream_info_ajoc (asio_group_index, asio_gs_index_ajoc, asio_b_substreams_present)
    {
        var n_fullband_upmix_signals_minus1;
        var substream_index;
        var b_oamd_common_data_present;
        var b_sf_multiplier;
        var b_bitrate_info;
        var n_fullband_dmx_signals;
        var n_fullband_upmix_signals;
        var si_b_iframe;
        var num_objects_DYNAMIC = null;
        var num_objects_DYNAMIC;
        var ajoc_b_lfe;
        var n_fullband_dmx_signals_minus1;
        var b_lfe = null;
        var b_lfe;
        var si_channel_mode_j;
        var b_static_dmx;
        var sf_multiplier;
        {
            {
                num_objects_DYNAMIC = this.BAM_g_table6.slice(0);
            }
            {
                this.F_define_channel_modes();
            }
            {
                ajoc_b_lfe = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                b_static_dmx = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_static_dmx)
            {
                {
                    {
                        n_fullband_dmx_signals = 5;
                    }
                    if (ajoc_b_lfe)
                    {
                        {
                            si_channel_mode_j = this.CHANNEL_MODE_51;
                        }
                    }
                    else
                    {
                        {
                            si_channel_mode_j = this.CHANNEL_MODE_50;
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        n_fullband_dmx_signals_minus1 = this.BAM_source.get("", 4);
                        this.BAM_g_position += 4;
                    }
                    {
                        n_fullband_dmx_signals = n_fullband_dmx_signals_minus1 + 1;
                    }
                    {
                        this.F_bed_dyn_obj_assignment(n_fullband_dmx_signals, 0, ajoc_b_lfe);
                    }
                }
            }
            {
                b_oamd_common_data_present = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_oamd_common_data_present)
            {
                {
                    this.F_oamd_common_data();
                }
            }
            {
                n_fullband_upmix_signals_minus1 = this.BAM_source.get("", 4);
                this.BAM_g_position += 4;
            }
            {
                n_fullband_upmix_signals = n_fullband_upmix_signals_minus1 + 1;
            }
            if (n_fullband_upmix_signals == 16)
            {
                {
                    {
                        this.v = this.F_variable_bits(3);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        n_fullband_upmix_signals = n_fullband_upmix_signals + this.v;
                    }
                }
            }
            {
                this.F_bed_dyn_obj_assignment(n_fullband_upmix_signals, 1, ajoc_b_lfe);
            }
            if (this.fs_index == 1)
            {
                {
                    {
                        b_sf_multiplier = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_sf_multiplier)
                    {
                        {
                            sf_multiplier = this.BAM_source.get("", 1);
                            this.BAM_g_position += 1;
                        }
                    }
                }
            }
            {
                b_bitrate_info = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_bitrate_info)
            {
                {
                    this.F_bitrate_indicator();
                }
            }
            {
                this.frame_rate_factor = this.group_frame_rate_factor[asio_group_index];
            }
            for (this.i = 0; this.i < this.frame_rate_factor; this.i++)
            {
                {
                    si_b_iframe = this.BAM_source.get("", 1);
                    this.BAM_g_position += 1;
                }
            }
            if (asio_b_substreams_present == 1)
            {
                {
                    {
                        substream_index = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    if (substream_index == 3)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                substream_index += this.v;
                            }
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        substream_index = this.bk_substream_index;
                    }
                    {
                        this.bk_substream_index = this.bk_substream_index + 1;
                    }
                }
            }
            {
                this.a_substream_indices.push(substream_index);
            }
            for (this.i = 0; this.i < this.frame_rate_factor; this.i++)
            {
                {
                    if (asio_b_substreams_present == 1)
                    {
                        {
                            {
                                this.last_referenced_substream = Math.max(this.last_referenced_substream, substream_index + this.i);
                            }
                            {
                                this.referenced_substreams.push(substream_index + this.i);
                            }
                        }
                    }
                    {
                        if (b_lfe == null)
                        {
                            b_lfe = new Array((substream_index + this.i) + 1).fill(0);
                        }
                        else if ((b_lfe).length <= substream_index + this.i)
                        {
                            b_lfe.push.apply(b_lfe, new Array((substream_index + this.i) - (b_lfe).length + 1).fill(0));
                        }
                        b_lfe[substream_index + this.i] = ajoc_b_lfe;
                    }
                }
            }
        }
    }

    F_ac4_sgi_specifier (asgi_b_associated, asgi_b_dialog, group_in_presentation_index)
    {
        var group_index;
        {
            if (this.bitstream_version == 1)
            {
                {
                    {
                        this.F_ac4_substream_group_info(this.toc_j);
                    }
                    {
                        this.toc_j += 1;
                    }
                }
            }
            else
            {
                {
                    {
                        group_index = this.BAM_source.get("", 3);
                        this.BAM_g_position += 3;
                    }
                    if (group_index == 7)
                    {
                        {
                            {
                                this.vb = this.F_variable_bits(2);
                                if (this.vb == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                group_index += this.vb;
                            }
                        }
                    }
                    {
                        if (this.presentation_to_groups == null)
                        {
                            this.presentation_to_groups = new Array((this.toc_i) + 1).fill(null);
                        }
                        else if ((this.presentation_to_groups).length <= this.toc_i)
                        {
                            this.presentation_to_groups.push.apply(this.presentation_to_groups, new Array((this.toc_i) - (this.presentation_to_groups).length + 1).fill(null));
                        }
                        this.presentation_to_groups[this.toc_i].push(group_index);
                    }
                    {
                        if (this.group_frame_rate_factor == null)
                        {
                            this.group_frame_rate_factor = new Array((group_index) + 1).fill(0);
                        }
                        else if ((this.group_frame_rate_factor).length <= group_index)
                        {
                            this.group_frame_rate_factor.push.apply(this.group_frame_rate_factor, new Array((group_index) - (this.group_frame_rate_factor).length + 1).fill(0));
                        }
                        this.group_frame_rate_factor[group_index] = this.frame_rate_factor;
                    }
                }
            }
        }
    }

    F_ac4_substream_group_info (si_group_index)
    {
        var obj_index;
        var b_dialog_content;
        var sus;
        var n_lf_substreams;
        var b_substreams_present;
        var b_channel_coded;
        var b_ajoc;
        var n_lf_substreams_minus2;
        var sus_ver;
        var b_oamd_substream;
        var b_content_type;
        var b_associated_content;
        {
            {
                b_substreams_present = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                this.b_hsf_ext = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                this.b_single_substream = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (this.b_single_substream)
            {
                {
                    n_lf_substreams = 1;
                }
            }
            else
            {
                {
                    {
                        n_lf_substreams_minus2 = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    {
                        n_lf_substreams = n_lf_substreams_minus2 + 2;
                    }
                    if (n_lf_substreams == 5)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                n_lf_substreams += this.v;
                            }
                        }
                    }
                }
            }
            {
                b_channel_coded = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                this.n_bed_objects = -1;
            }
            {
                this.a_num_bed_objects = [];
            }
            if (b_channel_coded)
            {
                {
                    {
                        b_ajoc = 0;
                    }
                    for (sus = 0; sus < n_lf_substreams; sus++)
                    {
                        {
                            if (this.bitstream_version == 1)
                            {
                                {
                                    sus_ver = this.BAM_source.get("", 1);
                                    this.BAM_g_position += 1;
                                }
                            }
                            else
                            {
                                {
                                    sus_ver = 1;
                                }
                            }
                            {
                                this.F_ac4_substream_info_chan(si_group_index, sus, b_substreams_present);
                            }
                            if (this.b_hsf_ext)
                            {
                                {
                                    this.F_ac4_hsf_ext_substream_info(b_substreams_present);
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        b_oamd_substream = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_oamd_substream)
                    {
                        {
                            this.F_oamd_substream_info(b_substreams_present);
                        }
                    }
                    {
                        obj_index = 0;
                    }
                    {
                        this.b_bed_objects_prev = 0;
                    }
                    for (sus = 0; sus < n_lf_substreams; sus++)
                    {
                        {
                            {
                                b_ajoc = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            if (b_ajoc)
                            {
                                {
                                    {
                                        this.F_ac4_substream_info_ajoc(si_group_index, sus, b_substreams_present);
                                    }
                                    if (this.b_hsf_ext)
                                    {
                                        {
                                            this.F_ac4_hsf_ext_substream_info(b_substreams_present);
                                        }
                                    }
                                }
                            }
                            else
                            {
                                {
                                    {
                                        this.F_ac4_substream_info_obj(si_group_index, sus, obj_index, b_substreams_present);
                                    }
                                    {
                                        obj_index += 1;
                                    }
                                    if (this.b_hsf_ext)
                                    {
                                        {
                                            this.F_ac4_hsf_ext_substream_info(b_substreams_present);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            {
                b_content_type = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_content_type)
            {
                {
                    {
                        this.F_content_type();
                    }
                    if ((this.content_classifier) == (0))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (1))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (2))
                    {
                        {
                            {
                                b_associated_content = 1;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (3))
                    {
                        {
                            {
                                b_associated_content = 1;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (4))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 1;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (5))
                    {
                        {
                            {
                                b_associated_content = 1;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (6))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                    else if ((this.content_classifier) == (7))
                    {
                        {
                            {
                                b_associated_content = 0;
                            }
                            {
                                b_dialog_content = 0;
                            }
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        b_associated_content = 0;
                    }
                    {
                        b_dialog_content = 0;
                    }
                }
            }
        }
    }

    F_oamd_substream_info (oamd_b_substreams_present)
    {
        var substream_index;
        var b_iframe_oamd;
        {
            {
                this.F_define_oamd();
            }
            {
                b_iframe_oamd = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (oamd_b_substreams_present == 1)
            {
                {
                    {
                        substream_index = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    if (substream_index == 3)
                    {
                        {
                            {
                                this.vb = this.F_variable_bits(2);
                                if (this.vb == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                substream_index += this.vb;
                            }
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        substream_index = this.bk_substream_index;
                    }
                    {
                        this.bk_substream_index = this.bk_substream_index + 1;
                    }
                }
            }
            if (oamd_b_substreams_present == 1)
            {
                {
                    {
                        this.last_referenced_substream = Math.max(this.last_referenced_substream, substream_index);
                    }
                    {
                        this.referenced_substreams.push(substream_index);
                    }
                }
            }
        }
    }

    F_ac4_substream_info_obj (asio_group_index, asio_gs_index, asio_gs_index_obj, asio_b_substreams_present)
    {
        var obj_type;
        var b_nonstd_bed_channel_assignment;
        var res_bytes;
        var b_bed_start;
        var bed_chan_assign_code;
        var j;
        var si_b_iframe;
        var n_objs;
        var si_num_channels;
        var reserved_data;
        var b_isf_start;
        var n_objects_code;
        var isf_config;
        var substream_index;
        var b_sf_multiplier;
        var b_bed_objects;
        var b_dynamic_objects;
        var b_bitrate_info;
        var b_isf;
        var nonstd_bed_channel_assignment_mask;
        var b_ch_assign_code;
        var b_lfe = null;
        var b_lfe;
        var std_bed_channel_assignment_mask;
        var sf_multiplier;
        var si_b_lfe;
        {
            {
                n_objs = 0;
            }
            {
                this.F_define_oamd();
            }
            {
                this.F_define_channel_modes();
            }
            {
                n_objects_code = this.BAM_source.get("", 3);
                this.BAM_g_position += 3;
            }
            {
                si_num_channels = this.BAM_g_table7.slice(0)[n_objects_code];
            }
            {
                b_dynamic_objects = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_dynamic_objects)
            {
                {
                    {
                        si_b_lfe = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    {
                        obj_type = this.OAMD_OBJECT_TYPE_DYNAMIC;
                    }
                    {
                        this.b_bed_objects_prev = 0;
                    }
                }
            }
            else
            {
                {
                    {
                        b_bed_objects = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_bed_objects)
                    {
                        {
                            if (this.b_bed_objects_prev && this.num_lfe == 2)
                            {
                                {
                                    si_b_lfe = 1;
                                }
                            }
                            else
                            {
                                {
                                    si_b_lfe = 0;
                                }
                            }
                            {
                                this.b_bed_objects_prev = 1;
                            }
                            {
                                this.num_lfe = 0;
                            }
                            {
                                obj_type = this.OAMD_OBJECT_TYPE_BED;
                            }
                            {
                                b_bed_start = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            if (b_bed_start)
                            {
                                {
                                    {
                                        b_ch_assign_code = this.BAM_source.get("", 1);
                                        this.BAM_g_position += 1;
                                    }
                                    if (b_ch_assign_code)
                                    {
                                        {
                                            {
                                                bed_chan_assign_code = this.BAM_source.get("", 3);
                                                this.BAM_g_position += 3;
                                            }
                                            for (this.i = 0; this.i < this.BAM_g_table8.slice(0)[bed_chan_assign_code]; this.i++)
                                            {
                                                {
                                                    n_objs += 1;
                                                }
                                            }
                                            if (bed_chan_assign_code >= 2)
                                            {
                                                {
                                                    si_b_lfe = 1;
                                                }
                                            }
                                        }
                                    }
                                    else
                                    {
                                        {
                                            {
                                                b_nonstd_bed_channel_assignment = this.BAM_source.get("", 1);
                                                this.BAM_g_position += 1;
                                            }
                                            if (b_nonstd_bed_channel_assignment)
                                            {
                                                {
                                                    {
                                                        nonstd_bed_channel_assignment_mask = this.BAM_source.get("", 17);
                                                        this.BAM_g_position += 17;
                                                    }
                                                    for (this.i = 0; this.i < 17; this.i++)
                                                    {
                                                        if ((nonstd_bed_channel_assignment_mask & 1 << this.i) != 0)
                                                        {
                                                            {
                                                                if (this.i == 3 || this.i == 16)
                                                                {
                                                                    {
                                                                        this.num_lfe += 1;
                                                                    }
                                                                }
                                                                {
                                                                    n_objs += 1;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                {
                                                    {
                                                        std_bed_channel_assignment_mask = this.BAM_source.get("", 10);
                                                        this.BAM_g_position += 10;
                                                    }
                                                    for (this.i = 0; this.i < 10; this.i++)
                                                    {
                                                        if ((std_bed_channel_assignment_mask & 1 << this.i) != 0)
                                                        {
                                                            for (j = 0; j < this.BAM_g_table9.slice(0)[this.i]; j++)
                                                            {
                                                                {
                                                                    if (this.i == 2 || this.i == 9)
                                                                    {
                                                                        {
                                                                            this.num_lfe += 1;
                                                                        }
                                                                    }
                                                                    {
                                                                        n_objs += 1;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            if (this.num_lfe > 0)
                                            {
                                                {
                                                    si_b_lfe = 1;
                                                }
                                            }
                                        }
                                    }
                                    {
                                        this.n_bed_objects = n_objs;
                                    }
                                    {
                                        this.a_num_bed_objects.push(this.n_bed_objects);
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        {
                            {
                                si_b_lfe = 0;
                            }
                            {
                                this.b_bed_objects_prev = 0;
                            }
                            {
                                b_isf = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            if (b_isf)
                            {
                                {
                                    {
                                        obj_type = this.OAMD_OBJECT_TYPE_ISF;
                                    }
                                    {
                                        b_isf_start = this.BAM_source.get("", 1);
                                        this.BAM_g_position += 1;
                                    }
                                    if (b_isf_start)
                                    {
                                        {
                                            isf_config = this.BAM_source.get("", 3);
                                            this.BAM_g_position += 3;
                                        }
                                    }
                                }
                            }
                            else
                            {
                                {
                                    {
                                        res_bytes = this.BAM_source.get("", 4);
                                        this.BAM_g_position += 4;
                                    }
                                    {
                                        reserved_data = this.BAM_source.get("", 8 * res_bytes);
                                        this.BAM_g_position += 8 * res_bytes;
                                    }
                                    {
                                        obj_type = this.OAMD_OBJECT_TYPE_RESERVED;
                                    }
                                    if (si_num_channels == 0)
                                    {
                                        throw "No non-LFE objects (of OAMD_OBJECT_TYPE_RESERVED) in substream!";
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.fs_index == 1)
            {
                {
                    {
                        b_sf_multiplier = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_sf_multiplier)
                    {
                        {
                            sf_multiplier = this.BAM_source.get("", 1);
                            this.BAM_g_position += 1;
                        }
                    }
                }
            }
            {
                b_bitrate_info = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_bitrate_info)
            {
                {
                    this.F_bitrate_indicator();
                }
            }
            {
                this.frame_rate_factor = this.group_frame_rate_factor[asio_group_index];
            }
            for (this.i = 0; this.i < this.frame_rate_factor; this.i++)
            {
                {
                    si_b_iframe = this.BAM_source.get("", 1);
                    this.BAM_g_position += 1;
                }
            }
            if (asio_b_substreams_present == 1)
            {
                {
                    {
                        substream_index = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    if (substream_index == 3)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                substream_index += this.v;
                            }
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        substream_index = this.bk_substream_index;
                    }
                    {
                        this.bk_substream_index = this.bk_substream_index + 1;
                    }
                }
            }
            {
                this.a_substream_indices.push(substream_index);
            }
            for (this.i = 0; this.i < this.frame_rate_factor; this.i++)
            {
                {
                    if (asio_b_substreams_present == 1)
                    {
                        {
                            {
                                this.last_referenced_substream = Math.max(this.last_referenced_substream, substream_index + this.i);
                            }
                            {
                                this.referenced_substreams.push(substream_index + this.i);
                            }
                        }
                    }
                    {
                        if (b_lfe == null)
                        {
                            b_lfe = new Array((substream_index + this.i) + 1).fill(0);
                        }
                        else if ((b_lfe).length <= substream_index + this.i)
                        {
                            b_lfe.push.apply(b_lfe, new Array((substream_index + this.i) - (b_lfe).length + 1).fill(0));
                        }
                        b_lfe[substream_index + this.i] = si_b_lfe;
                    }
                }
            }
        }
    }

    F_bed_dyn_obj_assignment (n_signals, b_upmix, bd_lfe)
    {
        var n_isf;
        var isf_config;
        var oc_num_channels;
        var obj_type;
        var n_bed_signals_minus1;
        var b_nonstd_bed_channel_assignment;
        var nonstd_bed_channel_assignment;
        var bed_chan_assign_code;
        var nonstd_bed_channel_assignment_mask;
        var lfe_signalled;
        var b_is_isf;
        var n_bed_signals;
        var bed_ch_bits;
        var b_ch_assign_code;
        var std_bed_channel_assignment_mask;
        var b_dyn_objects_only;
        var b_chan_assign_mask;
        var b;
        {
            {
                this.F_define_oamd();
            }
            {
                lfe_signalled = 0;
            }
            {
                b_dyn_objects_only = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_dyn_objects_only == 0)
            {
                {
                    {
                        b_is_isf = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_is_isf)
                    {
                        {
                            {
                                isf_config = this.BAM_source.get("", 3);
                                this.BAM_g_position += 3;
                            }
                            {
                                obj_type = this.OAMD_OBJECT_TYPE_ISF;
                            }
                            {
                                n_isf = this.BAM_g_table10.slice(0)[isf_config];
                            }
                        }
                    }
                    else
                    {
                        {
                            {
                                obj_type = this.OAMD_OBJECT_TYPE_BED;
                            }
                            {
                                b_ch_assign_code = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            if (b_ch_assign_code)
                            {
                                {
                                    {
                                        bed_chan_assign_code = this.BAM_source.get("", 3);
                                        this.BAM_g_position += 3;
                                    }
                                    if ((this.BAM_g_table11.slice(0).indexOf(bed_chan_assign_code) >= 0))
                                    {
                                        {
                                            lfe_signalled = 1;
                                        }
                                    }
                                }
                            }
                            else
                            {
                                {
                                    {
                                        b_chan_assign_mask = this.BAM_source.get("", 1);
                                        this.BAM_g_position += 1;
                                    }
                                    if (b_chan_assign_mask)
                                    {
                                        {
                                            {
                                                b_nonstd_bed_channel_assignment = this.BAM_source.get("", 1);
                                                this.BAM_g_position += 1;
                                            }
                                            if (b_nonstd_bed_channel_assignment)
                                            {
                                                {
                                                    {
                                                        nonstd_bed_channel_assignment_mask = this.BAM_source.get("", 17);
                                                        this.BAM_g_position += 17;
                                                    }
                                                    for (this.i = 0; this.i < 17; this.i++)
                                                    {
                                                        if (nonstd_bed_channel_assignment_mask >> this.i & 1)
                                                        {
                                                            if (this.i == 3 || this.i == 16)
                                                            {
                                                                {
                                                                    lfe_signalled = 1;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                {
                                                    {
                                                        std_bed_channel_assignment_mask = this.BAM_source.get("", 10);
                                                        this.BAM_g_position += 10;
                                                    }
                                                    for (this.i = 0; this.i < 10; this.i++)
                                                    {
                                                        if (std_bed_channel_assignment_mask >> this.i & 1)
                                                        {
                                                            {
                                                                if (this.i == 2 || this.i == 9)
                                                                {
                                                                    {
                                                                        lfe_signalled = 1;
                                                                    }
                                                                }
                                                                {
                                                                    oc_num_channels = this.BAM_g_table12.slice(0)[this.i];
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else
                                    {
                                        {
                                            if (n_signals > 1)
                                            {
                                                {
                                                    {
                                                        bed_ch_bits = Math.ceil(Math.log(n_signals) / Math.log(2));
                                                    }
                                                    {
                                                        n_bed_signals_minus1 = this.BAM_source.get("", bed_ch_bits);
                                                        this.BAM_g_position += bed_ch_bits;
                                                    }
                                                    {
                                                        n_bed_signals = n_bed_signals_minus1 + 1;
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                {
                                                    n_bed_signals = 1;
                                                }
                                            }
                                            for (b = 0; b < n_bed_signals; b++)
                                            {
                                                {
                                                    {
                                                        nonstd_bed_channel_assignment = this.BAM_source.get("", 4);
                                                        this.BAM_g_position += 4;
                                                    }
                                                    if (n_bed_signals == 3 || n_bed_signals == 16)
                                                    {
                                                        {
                                                            lfe_signalled = 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    F_ac4_presentation_substream_info (aps_presentation_version)
    {
        var substream_index;
        var b_lfe = null;
        var b_lfe;
        var b_alternative;
        var b_iframe_pres;
        {
            {
                b_alternative = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                b_iframe_pres = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                substream_index = this.BAM_source.get("", 2);
                this.BAM_g_position += 2;
            }
            if (substream_index == 3)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        substream_index += this.v;
                    }
                }
            }
            {
                if (b_lfe == null)
                {
                    b_lfe = new Array((substream_index) + 1).fill(0);
                }
                else if ((b_lfe).length <= substream_index)
                {
                    b_lfe.push.apply(b_lfe, new Array((substream_index) - (b_lfe).length + 1).fill(0));
                }
                b_lfe[substream_index] = 0;
            }
            {
                this.last_referenced_substream = Math.max(this.last_referenced_substream, substream_index);
            }
            {
                this.referenced_substreams.push(substream_index);
            }
        }
    }

    F_presentation_version ()
    {
        var val;
        var b_tmp;
        {
            {
                val = 0;
            }
            {
                b_tmp = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            while (b_tmp)
            {
                {
                    {
                        val = val + 1;
                    }
                    {
                        b_tmp = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                }
            }
            return val;
        }
    }

    F_get_ch_mode (cm)
    {
        {
            if ((cm) == (this.CHANNEL_MODE_MONO))
            {
                {
                    this.n = 0;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_STEREO))
            {
                {
                    this.n = 1;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_30))
            {
                {
                    this.n = 2;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_50))
            {
                {
                    this.n = 3;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_51))
            {
                {
                    this.n = 4;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_70_34))
            {
                {
                    this.n = 5;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_71_34))
            {
                {
                    this.n = 6;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_70_52))
            {
                {
                    this.n = 7;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_71_52))
            {
                {
                    this.n = 8;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_70_322))
            {
                {
                    this.n = 9;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_71_322))
            {
                {
                    this.n = 10;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_704))
            {
                {
                    this.n = 11;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_714))
            {
                {
                    this.n = 12;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_904))
            {
                {
                    this.n = 13;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_914))
            {
                {
                    this.n = 14;
                }
            }
            else
            {
                if (1)
                {
                    throw "Unknown channel mode!";
                }
            }
            return this.n;
        }
    }

    F_presentation_config_ext_info ()
    {
        {
            {
                this.n_skip_bytes = this.BAM_source.get("", 5);
                this.BAM_g_position += 5;
            }
            {
                this.b_more_skip_bytes = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (this.b_more_skip_bytes)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        this.n_skip_bytes += this.v << 5;
                    }
                }
            }
            if (0)
            {
                {
                    {
                        this.n_bits_read_0 = this.BAM_g_position;
                    }
                    {
                        this.F_ac4_presentation_v2_info(this.toc_i);
                    }
                    {
                        this.n_bits_read_1 = this.BAM_g_position;
                    }
                    {
                        this.n_bits_read = this.n_bits_read_1 - this.n_bits_read_0;
                    }
                    if (((n_bits_read % 8) + 8) % 8)
                    {
                        {
                            {
                                this.n_skip_bits = 8 - ((n_bits_read % 8) + 8) % 8;
                            }
                            {
                                this.reserved = this.BAM_source.get("", this.n_skip_bits);
                                this.BAM_g_position += this.n_skip_bits;
                            }
                            {
                                this.n_bits_read += this.n_skip_bits;
                            }
                        }
                    }
                    {
                        this.n_skip_bytes = this.n_skip_bytes - Math.floor(this.n_bits_read / 8);
                    }
                }
            }
            if (this.bitstream_version >= 1 && this.presentation_config == 8)
            {
                {
                    {
                        this.n_bits_read_0 = this.BAM_g_position;
                    }
                    {
                        this.n_bits_read_1 = this.BAM_g_position;
                    }
                    {
                        this.padding = this.BAM_source.get("", this.n_skip_bytes * 8 - (this.n_bits_read_1 - this.n_bits_read_0));
                        this.BAM_g_position += this.n_skip_bytes * 8 - (this.n_bits_read_1 - this.n_bits_read_0);
                    }
                }
            }
            else
            {
                for (this.i = 0; this.i < this.n_skip_bytes; this.i++)
                {
                    {
                        this.reserved = this.BAM_source.get("", 8);
                        this.BAM_g_position += 8;
                    }
                }
            }
        }
    }

    F_define_channel_modes ()
    {
        var CHANNEL_MODE_7X_34 = null;
        var CHANNEL_MODE_7X_34;
        var CHANNEL_MODE_7X_322 = null;
        var CHANNEL_MODE_7X_322;
        var CHANNEL_MODE_7X = null;
        var CHANNEL_MODE_7X;
        var CHANNEL_MODE_7X_52 = null;
        var CHANNEL_MODE_7X_52;
        var CHANNEL_MODE_5X = null;
        var CHANNEL_MODE_5X;
        {
            {
                this.CHANNEL_MODE_MONO = 0;
            }
            {
                this.CHANNEL_MODE_STEREO = 2;
            }
            {
                this.CHANNEL_MODE_30 = 12;
            }
            {
                this.CHANNEL_MODE_50 = 13;
            }
            {
                this.CHANNEL_MODE_51 = 14;
            }
            {
                this.CHANNEL_MODE_70_34 = 120;
            }
            {
                this.CHANNEL_MODE_71_34 = 121;
            }
            {
                this.CHANNEL_MODE_70_52 = 122;
            }
            {
                this.CHANNEL_MODE_71_52 = 123;
            }
            {
                this.CHANNEL_MODE_70_322 = 124;
            }
            {
                this.CHANNEL_MODE_71_322 = 125;
            }
            {
                this.CHANNEL_MODE_704 = 252;
            }
            {
                this.CHANNEL_MODE_714 = 253;
            }
            {
                this.CHANNEL_MODE_904 = 508;
            }
            {
                this.CHANNEL_MODE_914 = 509;
            }
            {
                this.CHANNEL_MODE_222 = 510;
            }
            {
                CHANNEL_MODE_5X = [this.CHANNEL_MODE_50, this.CHANNEL_MODE_51];
            }
            {
                CHANNEL_MODE_7X_34 = [this.CHANNEL_MODE_70_34, this.CHANNEL_MODE_71_34];
            }
            {
                CHANNEL_MODE_7X_52 = [this.CHANNEL_MODE_70_52, this.CHANNEL_MODE_71_52];
            }
            {
                CHANNEL_MODE_7X_322 = [this.CHANNEL_MODE_70_322, this.CHANNEL_MODE_71_322];
            }
            {
                CHANNEL_MODE_7X = CHANNEL_MODE_7X_34 + CHANNEL_MODE_7X_52 + CHANNEL_MODE_7X_322;
            }
        }
    }

    F_channel_mode_to_ch_mode (cm)
    {
        {
            if ((cm) == (this.CHANNEL_MODE_MONO))
            {
                return 0;
            }
            else if ((cm) == (this.CHANNEL_MODE_STEREO))
            {
                return 1;
            }
            else if ((cm) == (this.CHANNEL_MODE_30))
            {
                return 2;
            }
            else if ((cm) == (this.CHANNEL_MODE_50))
            {
                return 3;
            }
            else if ((cm) == (this.CHANNEL_MODE_51))
            {
                return 4;
            }
            else if ((cm) == (this.CHANNEL_MODE_70_34))
            {
                return 5;
            }
            else if ((cm) == (this.CHANNEL_MODE_71_34))
            {
                return 6;
            }
            else if ((cm) == (this.CHANNEL_MODE_70_52))
            {
                return 7;
            }
            else if ((cm) == (this.CHANNEL_MODE_71_52))
            {
                return 8;
            }
            else if ((cm) == (this.CHANNEL_MODE_70_322))
            {
                return 9;
            }
            else if ((cm) == (this.CHANNEL_MODE_71_322))
            {
                return 10;
            }
            else if ((cm) == (this.CHANNEL_MODE_704))
            {
                return 11;
            }
            else if ((cm) == (this.CHANNEL_MODE_714))
            {
                return 12;
            }
            else if ((cm) == (this.CHANNEL_MODE_904))
            {
                return 13;
            }
            else if ((cm) == (this.CHANNEL_MODE_914))
            {
                return 14;
            }
            else if ((cm) == (this.CHANNEL_MODE_222))
            {
                return 15;
            }
            else
            {
                if (1)
                {
                    throw "Cannot convert extended channel mode to ch_mode!";
                }
            }
        }
    }

    F_variable_bits (n_bits)
    {
        var read;
        var value;
        var b_read_more;
        {
            {
                value = 0;
            }
            {
                b_read_more = 1;
            }
            while (b_read_more)
            {
                {
                    {
                        read = this.BAM_source.get("", n_bits);
                        this.BAM_g_position += n_bits;
                    }
                    {
                        value += read;
                    }
                    {
                        b_read_more = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_read_more)
                    {
                        {
                            {
                                value <<= n_bits;
                            }
                            {
                                value += 1 << n_bits;
                            }
                        }
                    }
                }
            }
            return value;
        }
    }

    F_raw_ac4_frame_toc_only ()
    {
        var ac4_toc_end;
        var ac4_toc_begin;
        var frame_len_base;
        {
            {
                ac4_toc_begin = this.BAM_g_position;
            }
            {
                this.F_ac4_toc();
            }
            {
                ac4_toc_end = this.BAM_g_position;
                this.BAM_sink.after_position("ac4_toc_end", ac4_toc_end);
            }
            {
                frame_len_base = this.BAM_g_table13.slice(0)[this.frame_rate_index];
            }
        }
    }

    F_ac4_presentation_info ()
    {
        {
            {
                this.b_single_substream = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (this.b_single_substream != 1)
            {
                {
                    {
                        this.presentation_config = this.BAM_source.get("", 3);
                        this.BAM_g_position += 3;
                    }
                    if (this.presentation_config == 7)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                this.presentation_config += this.v;
                            }
                        }
                    }
                }
            }
            {
                this.presentation_version = this.F_presentation_version();
                if (this.presentation_version == null)
                {
                    throw ParseError("F_presentation_version", "expected to return a value, returned None");
                }
            }
            if (this.b_single_substream != 1 && this.presentation_config == 6)
            {
                {
                    this.b_add_emdf_substreams = 1;
                }
            }
            else
            {
                {
                    {
                        this.presentation_level = this.BAM_source.get("", 3);
                        this.BAM_g_position += 3;
                        this.BAM_sink.write_uint("presentation_level", 3, this.presentation_level, this.BAM_g_position);
                    }
                    {
                        this.b_presentation_id = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                        this.BAM_sink.write_uint("b_presentation_id", 1, this.b_presentation_id, this.BAM_g_position);
                    }
                    if (this.b_presentation_id)
                    {
                        {
                            this.BAM_sink.before_call("variable_bits", [2], "presentation_id", this.BAM_g_position);
                            this.presentation_id = this.F_variable_bits(2);
                            if (this.presentation_id == null)
                            {
                                throw ParseError("F_variable_bits", "expected to return a value, returned None");
                            }
                            this.BAM_sink.after_call("variable_bits", this.presentation_id, "presentation_id", this.BAM_g_position);
                        }
                    }
                    {
                        this.F_frame_rate_multiply_info();
                    }
                    {
                        this.F_emdf_info();
                    }
                    if (this.b_single_substream == 1)
                    {
                        {
                            this.F_ac4_substream_info(0, 0, 0);
                        }
                    }
                    else
                    {
                        {
                            {
                                this.b_hsf_ext = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            if ((this.presentation_config) == (0))
                            {
                                {
                                    {
                                        this.F_ac4_substream_info(0, 0, 0);
                                    }
                                    if (this.b_hsf_ext)
                                    {
                                        {
                                            this.F_ac4_hsf_ext_substream_info(1);
                                        }
                                    }
                                    {
                                        this.F_ac4_substream_info(0, 1, 1);
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (1))
                            {
                                {
                                    {
                                        this.F_ac4_substream_info(0, 0, 0);
                                    }
                                    if (this.b_hsf_ext)
                                    {
                                        {
                                            this.F_ac4_hsf_ext_substream_info(1);
                                        }
                                    }
                                    {
                                        this.F_ac4_substream_info(0, 0, 1);
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (2))
                            {
                                {
                                    {
                                        this.F_ac4_substream_info(0, 0, 0);
                                    }
                                    if (this.b_hsf_ext)
                                    {
                                        {
                                            this.F_ac4_hsf_ext_substream_info(1);
                                        }
                                    }
                                    {
                                        this.F_ac4_substream_info(1, 0, 1);
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (3))
                            {
                                {
                                    {
                                        this.F_ac4_substream_info(0, 0, 0);
                                    }
                                    if (this.b_hsf_ext)
                                    {
                                        {
                                            this.F_ac4_hsf_ext_substream_info(1);
                                        }
                                    }
                                    {
                                        this.F_ac4_substream_info(0, 1, 1);
                                    }
                                    {
                                        this.F_ac4_substream_info(1, 0, 2);
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (4))
                            {
                                {
                                    {
                                        this.F_ac4_substream_info(0, 0, 0);
                                    }
                                    if (this.b_hsf_ext)
                                    {
                                        {
                                            this.F_ac4_hsf_ext_substream_info(1);
                                        }
                                    }
                                    {
                                        this.F_ac4_substream_info(0, 0, 1);
                                    }
                                    {
                                        this.F_ac4_substream_info(1, 0, 2);
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (5))
                            {
                                {
                                    {
                                        this.F_ac4_substream_info(0, 0, 0);
                                    }
                                    if (this.b_hsf_ext)
                                    {
                                        {
                                            this.F_ac4_hsf_ext_substream_info(1);
                                        }
                                    }
                                }
                            }
                            else
                            {
                                {
                                    this.F_presentation_config_ext_info();
                                }
                            }
                        }
                    }
                    {
                        this.b_pre_virtualized = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    {
                        this.b_add_emdf_substreams = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                }
            }
            if (this.b_add_emdf_substreams)
            {
                {
                    {
                        this.n_add_emdf_substreams = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    if (this.n_add_emdf_substreams == 0)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                this.n_add_emdf_substreams = this.v + 4;
                            }
                        }
                    }
                    for (this.pi_i = 0; this.pi_i < this.n_add_emdf_substreams; this.pi_i++)
                    {
                        {
                            this.F_emdf_info();
                        }
                    }
                }
            }
        }
    }

    F_substream_index_table ()
    {
        var b_size_present;
        var substream_type = null;
        var substream_type;
        var b_substream_type_known = null;
        var b_substream_type_known;
        var substream_size = null;
        var substream_size;
        var n_substreams;
        var s;
        var b_more_bits;
        {
            {
                n_substreams = this.BAM_source.get("", 2);
                this.BAM_g_position += 2;
            }
            if (n_substreams == 0)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        n_substreams = this.v + 4;
                    }
                }
            }
            if (n_substreams - 1 < this.last_referenced_substream)
            {
                throw "Number of substreams (n_substreams) indicated by substream_index_table is less than last referenced substream in TOC (last_referenced_substream).";
            }
            if (n_substreams - 1 > this.last_referenced_substream)
            {
                {
                    {
                        if (b_substream_type_known == null)
                        {
                            b_substream_type_known = new Array((n_substreams - 1) + 1).fill(0);
                        }
                        else if ((b_substream_type_known).length <= n_substreams - 1)
                        {
                            b_substream_type_known.push.apply(b_substream_type_known, new Array((n_substreams - 1) - (b_substream_type_known).length + 1).fill(0));
                        }
                        b_substream_type_known[n_substreams - 1] = 0;
                    }
                    {
                        if (substream_type == null)
                        {
                            substream_type = new Array((n_substreams - 1) + 1).fill(null);
                        }
                        else if ((substream_type).length <= n_substreams - 1)
                        {
                            substream_type.push.apply(substream_type, new Array((n_substreams - 1) - (substream_type).length + 1).fill(null));
                        }
                        substream_type[n_substreams - 1] = "unknown";
                    }
                }
            }
            if (n_substreams == 1)
            {
                {
                    b_size_present = this.BAM_source.get("", 1);
                    this.BAM_g_position += 1;
                }
            }
            else
            {
                {
                    b_size_present = 1;
                }
            }
            if (b_size_present)
            {
                for (s = 0; s < n_substreams; s++)
                {
                    {
                        {
                            b_more_bits = this.BAM_source.get("", 1);
                            this.BAM_g_position += 1;
                        }
                        {
                            if (substream_size == null)
                            {
                                substream_size = new Array((s) + 1).fill(0);
                            }
                            else if ((substream_size).length <= s)
                            {
                                substream_size.push.apply(substream_size, new Array((s) - (substream_size).length + 1).fill(0));
                            }
                            substream_size[s] = this.BAM_source.get("", 10);
                            this.BAM_g_position += 10;
                        }
                        if (b_more_bits)
                        {
                            {
                                {
                                    this.v = this.F_variable_bits(2);
                                    if (this.v == null)
                                    {
                                        throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                    }
                                }
                                {
                                    if (substream_size == null)
                                    {
                                        substream_size = new Array((s) + 1).fill(0);
                                    }
                                    else if ((substream_size).length <= s)
                                    {
                                        substream_size.push.apply(substream_size, new Array((s) - (substream_size).length + 1).fill(0));
                                    }
                                    substream_size[s] += this.v << 10;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    F_ac4_presentation_v2_info (apv_toc_i)
    {
        {
            {
                if (this.presentation_to_groups == null)
                {
                    this.presentation_to_groups = new Array((this.toc_i) + 1).fill(null);
                }
                else if ((this.presentation_to_groups).length <= this.toc_i)
                {
                    this.presentation_to_groups.push.apply(this.presentation_to_groups, new Array((this.toc_i) - (this.presentation_to_groups).length + 1).fill(null));
                }
                this.presentation_to_groups[this.toc_i] = [];
            }
            {
                this.b_single_substream_group = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (this.b_single_substream_group != 1)
            {
                {
                    {
                        this.presentation_config = this.BAM_source.get("", 3);
                        this.BAM_g_position += 3;
                    }
                    if (this.presentation_config == 7)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                this.presentation_config += this.v;
                            }
                        }
                    }
                }
            }
            if (this.bitstream_version != 1)
            {
                {
                    this.presentation_version = this.F_presentation_version();
                    if (this.presentation_version == null)
                    {
                        throw ParseError("F_presentation_version", "expected to return a value, returned None");
                    }
                }
            }
            if (this.b_single_substream_group != 1 && this.presentation_config == 6)
            {
                {
                    this.b_add_emdf_substreams = 1;
                }
            }
            else
            {
                {
                    if (this.bitstream_version != 1)
                    {
                        {
                            this.presentation_level = this.BAM_source.get("", 3);
                            this.BAM_g_position += 3;
                            this.BAM_sink.write_uint("presentation_level", 3, this.presentation_level, this.BAM_g_position);
                        }
                    }
                    {
                        this.b_presentation_id = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                        this.BAM_sink.write_uint("b_presentation_id", 1, this.b_presentation_id, this.BAM_g_position);
                    }
                    if (this.b_presentation_id)
                    {
                        {
                            this.BAM_sink.before_call("variable_bits", [2], "presentation_id", this.BAM_g_position);
                            this.presentation_id = this.F_variable_bits(2);
                            if (this.presentation_id == null)
                            {
                                throw ParseError("F_variable_bits", "expected to return a value, returned None");
                            }
                            this.BAM_sink.after_call("variable_bits", this.presentation_id, "presentation_id", this.BAM_g_position);
                        }
                    }
                    {
                        this.F_frame_rate_multiply_info();
                    }
                    {
                        this.F_frame_rate_fractions_info();
                    }
                    {
                        this.F_emdf_info();
                    }
                    {
                        this.b_presentation_filter = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (this.b_presentation_filter)
                    {
                        {
                            this.b_enable_presentation = this.BAM_source.get("", 1);
                            this.BAM_g_position += 1;
                        }
                    }
                    if (this.b_single_substream_group == 1)
                    {
                        {
                            {
                                this.F_ac4_sgi_specifier(0, 0, 0);
                            }
                            {
                                this.n_substream_groups = 1;
                            }
                        }
                    }
                    else
                    {
                        {
                            {
                                this.b_multi_pid = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            if ((this.presentation_config) == (0))
                            {
                                {
                                    {
                                        this.F_ac4_sgi_specifier(0, 0, 0);
                                    }
                                    {
                                        this.F_ac4_sgi_specifier(0, 1, 1);
                                    }
                                    {
                                        this.n_substream_groups = 2;
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (1))
                            {
                                {
                                    {
                                        this.F_ac4_sgi_specifier(0, 0, 0);
                                    }
                                    {
                                        this.F_ac4_sgi_specifier(0, 0, 1);
                                    }
                                    {
                                        this.n_substream_groups = 1;
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (2))
                            {
                                {
                                    {
                                        this.F_ac4_sgi_specifier(0, 0, 0);
                                    }
                                    {
                                        this.F_ac4_sgi_specifier(1, 0, 1);
                                    }
                                    {
                                        this.n_substream_groups = 2;
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (3))
                            {
                                {
                                    {
                                        this.F_ac4_sgi_specifier(0, 0, 0);
                                    }
                                    {
                                        this.F_ac4_sgi_specifier(0, 1, 1);
                                    }
                                    {
                                        this.F_ac4_sgi_specifier(1, 0, 2);
                                    }
                                    {
                                        this.n_substream_groups = 3;
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (4))
                            {
                                {
                                    {
                                        this.F_ac4_sgi_specifier(0, 0, 0);
                                    }
                                    {
                                        this.F_ac4_sgi_specifier(0, 0, 1);
                                    }
                                    {
                                        this.F_ac4_sgi_specifier(1, 0, 2);
                                    }
                                    {
                                        this.n_substream_groups = 2;
                                    }
                                }
                            }
                            else if ((this.presentation_config) == (5))
                            {
                                {
                                    {
                                        this.n_substream_groups_minus2 = this.BAM_source.get("", 2);
                                        this.BAM_g_position += 2;
                                    }
                                    {
                                        this.n_substream_groups = this.n_substream_groups_minus2 + 2;
                                    }
                                    if (this.n_substream_groups == 5)
                                    {
                                        {
                                            {
                                                this.v = this.F_variable_bits(2);
                                                if (this.v == null)
                                                {
                                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                                }
                                            }
                                            {
                                                this.n_substream_groups += this.v;
                                            }
                                        }
                                    }
                                    for (this.sg = 0; this.sg < this.n_substream_groups; this.sg++)
                                    {
                                        {
                                            this.F_ac4_sgi_specifier(0, 0, 0);
                                        }
                                    }
                                }
                            }
                            else
                            {
                                {
                                    {
                                        this.n_substream_groups = 0;
                                    }
                                    {
                                        this.F_presentation_config_ext_info();
                                    }
                                }
                            }
                        }
                    }
                    {
                        this.b_pre_virtualized = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    {
                        this.b_add_emdf_substreams = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    {
                        this.F_ac4_presentation_substream_info(this.presentation_version);
                    }
                }
            }
            if (this.b_add_emdf_substreams)
            {
                {
                    {
                        this.n_add_emdf_substreams = this.BAM_source.get("", 2);
                        this.BAM_g_position += 2;
                    }
                    if (this.n_add_emdf_substreams == 0)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                this.n_add_emdf_substreams = this.v + 4;
                            }
                        }
                    }
                    for (this.pi_i = 0; this.pi_i < this.n_add_emdf_substreams; this.pi_i++)
                    {
                        {
                            this.F_emdf_info();
                        }
                    }
                }
            }
        }
    }

    F_frame_size ()
    {
        var frame_size;
        {
            {
                frame_size = this.BAM_source.get("", 16);
                this.BAM_g_position += 16;
            }
            if (frame_size == 65535)
            {
                {
                    frame_size = this.BAM_source.get("", 24);
                    this.BAM_g_position += 24;
                }
            }
        }
    }

    F_ac4_toc ()
    {
        var b_wait_frames;
        var payload_base_minus1;
        var n_presentations;
        var wait_frames;
        var b_payload_base;
        var program_uuid;
        var total_n_substream_groups;
        var payload_base;
        var b_program_uuid_present;
        var b_single_presentation;
        var b_iframe_global;
        var sequence_counter;
        var b_program_id;
        var b_more_presentations;
        var short_program_id;
        {
            {
                this.bitstream_version = this.BAM_source.get("", 2);
                this.BAM_g_position += 2;
            }
            if (this.bitstream_version == 3)
            {
                {
                    {
                        this.v = this.F_variable_bits(2);
                        if (this.v == null)
                        {
                            throw ParseError("F_variable_bits", "expected to return a value, returned None");
                        }
                    }
                    {
                        this.bitstream_version += this.v;
                    }
                }
            }
            {
                sequence_counter = this.BAM_source.get("", 10);
                this.BAM_g_position += 10;
            }
            {
                b_wait_frames = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_wait_frames)
            {
                {
                    {
                        wait_frames = this.BAM_source.get("", 3);
                        this.BAM_g_position += 3;
                    }
                    if (wait_frames > 0)
                    {
                        {
                            this.reserved = this.BAM_source.get("", 2);
                            this.BAM_g_position += 2;
                        }
                    }
                }
            }
            {
                this.fs_index = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                this.frame_rate_index = this.BAM_source.get("", 4);
                this.BAM_g_position += 4;
            }
            if (this.frame_rate_index > 13)
            {
                throw "frame_rate_index must be in range 0..13";
            }
            if (this.fs_index == 0 && this.frame_rate_index != 13)
            {
                throw "44.1kHz sampling rate && frame rates other than 13 are illegal. See table 84 in the ETSI spec.";
            }
            {
                b_iframe_global = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            {
                b_single_presentation = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_single_presentation)
            {
                {
                    n_presentations = 1;
                }
            }
            else
            {
                {
                    {
                        b_more_presentations = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_more_presentations)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(2);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                n_presentations = this.v + 2;
                            }
                        }
                    }
                    else
                    {
                        {
                            n_presentations = 0;
                        }
                    }
                }
            }
            {
                payload_base = 0;
            }
            {
                b_payload_base = this.BAM_source.get("", 1);
                this.BAM_g_position += 1;
            }
            if (b_payload_base)
            {
                {
                    {
                        payload_base_minus1 = this.BAM_source.get("", 5);
                        this.BAM_g_position += 5;
                        this.BAM_sink.write_uint("payload_base_minus1", 5, payload_base_minus1, this.BAM_g_position);
                    }
                    {
                        payload_base = payload_base_minus1 + 1;
                    }
                    if (payload_base == 32)
                    {
                        {
                            {
                                this.v = this.F_variable_bits(3);
                                if (this.v == null)
                                {
                                    throw ParseError("F_variable_bits", "expected to return a value, returned None");
                                }
                            }
                            {
                                payload_base += this.v;
                            }
                        }
                    }
                }
            }
            {
                this.a_substream_indices = [];
            }
            {
                this.last_referenced_substream = -1;
            }
            {
                this.referenced_substreams = [];
            }
            {
                this.bk_substream_index = 100;
            }
            if (this.bitstream_version <= 1)
            {
                {
                    {
                        this.toc_j = 0;
                    }
                    for (this.toc_i = 0; this.toc_i < n_presentations; this.toc_i++)
                    {
                        {
                            this.F_ac4_presentation_info();
                        }
                    }
                }
            }
            else
            {
                {
                    {
                        b_program_id = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_program_id)
                    {
                        {
                            {
                                short_program_id = this.BAM_source.get("", 16);
                                this.BAM_g_position += 16;
                            }
                            {
                                b_program_uuid_present = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            if (b_program_uuid_present)
                            {
                                {
                                    program_uuid = this.BAM_source.get("", 16 * 8);
                                    this.BAM_g_position += 16 * 8;
                                }
                            }
                        }
                    }
                    {
                        total_n_substream_groups = 0;
                    }
                    for (this.toc_i = 0; this.toc_i < n_presentations; this.toc_i++)
                    {
                        {
                            {
                                this.F_ac4_presentation_v2_info(this.toc_i);
                            }
                            for (this.i = 0; this.i < (this.presentation_to_groups[this.toc_i]).length; this.i++)
                            {
                                {
                                    total_n_substream_groups = Math.max(total_n_substream_groups, 1 + this.presentation_to_groups[this.toc_i][this.i]);
                                }
                            }
                        }
                    }
                    for (this.toc_j = 0; this.toc_j < total_n_substream_groups; this.toc_j++)
                    {
                        {
                            this.F_ac4_substream_group_info(this.toc_j);
                        }
                    }
                }
            }
            {
                this.F_substream_index_table();
            }
            {
                this.BAM_l_align = ((8 - ((this.BAM_g_position % 8) + 8) % 8 % 8) + 8) % 8;
                this.BAM_l_align_val = this.BAM_source.get_align(this.BAM_l_align);
                this.BAM_sink.write_align(((8 - ((this.BAM_g_position % 8) + 8) % 8 % 8) + 8) % 8, this.BAM_l_align_val);
                this.BAM_g_position += this.BAM_l_align;
            }
        }
    }

    F_get_num_channels (cm)
    {
        {
            if ((cm) == (this.CHANNEL_MODE_MONO))
            {
                {
                    this.n = 1;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_STEREO))
            {
                {
                    this.n = 2;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_30))
            {
                {
                    this.n = 3;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_50))
            {
                {
                    this.n = 5;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_51))
            {
                {
                    this.n = 6;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_70_34))
            {
                {
                    this.n = 7;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_71_34))
            {
                {
                    this.n = 8;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_70_52))
            {
                {
                    this.n = 7;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_71_52))
            {
                {
                    this.n = 8;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_70_322))
            {
                {
                    this.n = 7;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_71_322))
            {
                {
                    this.n = 8;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_704))
            {
                {
                    this.n = 11;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_714))
            {
                {
                    this.n = 12;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_904))
            {
                {
                    this.n = 13;
                }
            }
            else if ((cm) == (this.CHANNEL_MODE_914))
            {
                {
                    this.n = 14;
                }
            }
            else
            {
                if (1)
                {
                    throw "Unknown channel mode!";
                }
            }
            return this.n;
        }
    }

    F_frame_rate_multiply_info ()
    {
        var multiplier_bit;
        var b_multiplier;
        {
            if ((this.BAM_g_table14.slice(0).indexOf(this.frame_rate_index) >= 0))
            {
                {
                    {
                        b_multiplier = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_multiplier)
                    {
                        {
                            {
                                multiplier_bit = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            {
                                this.frame_rate_factor = this.BAM_g_table15[multiplier_bit];
                            }
                        }
                    }
                    else
                    {
                        {
                            this.frame_rate_factor = 1;
                        }
                    }
                }
            }
            else
            {
                if ((this.BAM_g_table16.slice(0).indexOf(this.frame_rate_index) >= 0))
                {
                    {
                        {
                            b_multiplier = this.BAM_source.get("", 1);
                            this.BAM_g_position += 1;
                        }
                        {
                            this.frame_rate_factor = this.BAM_g_table17[b_multiplier];
                        }
                    }
                }
                else
                {
                    {
                        this.frame_rate_factor = 1;
                    }
                }
            }
        }
    }

    F_frame_rate_fractions_info ()
    {
        var b_frame_rate_fraction_is_4;
        var frame_rate_fraction;
        var b_frame_rate_fraction;
        {
            {
                frame_rate_fraction = 1;
            }
            if ((this.BAM_g_table18.slice(0).indexOf(this.frame_rate_index) >= 0))
            {
                if (this.frame_rate_factor == 1)
                {
                    {
                        {
                            b_frame_rate_fraction = this.BAM_source.get("", 1);
                            this.BAM_g_position += 1;
                        }
                        if (b_frame_rate_fraction == 1)
                        {
                            {
                                frame_rate_fraction = 2;
                            }
                        }
                    }
                }
            }
            if ((this.BAM_g_table19.slice(0).indexOf(this.frame_rate_index) >= 0))
            {
                {
                    {
                        b_frame_rate_fraction = this.BAM_source.get("", 1);
                        this.BAM_g_position += 1;
                    }
                    if (b_frame_rate_fraction == 1)
                    {
                        {
                            {
                                b_frame_rate_fraction_is_4 = this.BAM_source.get("", 1);
                                this.BAM_g_position += 1;
                            }
                            if (b_frame_rate_fraction_is_4 == 1)
                            {
                                {
                                    frame_rate_fraction = 4;
                                }
                            }
                            else
                            {
                                {
                                    frame_rate_fraction = 2;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
export default Parser;
