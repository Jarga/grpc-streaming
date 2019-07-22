<template>
    <header :class="className">
        <div>
            <i class="far fa-comment-alt fa-lg"></i>
            &nbsp;
            <span>Put {{ text }} here</span>
        </div>
        <div>
            <i class="far fa-user fa-lg"></i>
        </div>
    </header>
</template>

<script>
import { css } from 'emotion'
import {
    primaryColor,
    navHeight,
} from '../util'

const cn = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    height: ${navHeight};
    font-size: 1.6rem;
    background-color: ${primaryColor};
    color: #fff;
`

export default {
    data () {
        return {
            className: cn,
            text: 'routing tabs'
        };
    },
}
</script>
