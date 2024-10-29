<script lang="ts">
    import "@fontsource/inter/900.css"
    import "@fontsource/open-sans/800-italic.css"

    export let title = "Distopia";
    export let titleLink = "/";
</script>

<header>
    <div class="header">
        <div class="header-title">
            <a href="{titleLink}">
                <p>{title}</p>
            </a>
        </div>
        <div class="header-other">
            <a href="/about">
                <p>About</p>
            </a>
        </div>
    </div>
</header>

<style lang="scss">
    header {
        position: sticky;
        top: 0;
        background-color: rgb(28, 67, 151);

        .header-title {
            color: white;
            font-size: 30px;
            padding: 10px 15px;

            p {
                color: white;
            }
        }
        .header-other {
            text-align: right;
            color: white;

            p {
                padding: 0 20px;
            }
        }
        .header-title p,
        .header-other {
            font-family: fantasy;
        }
        a {
            text-decoration: none;
        }
        div {
            display: inline-block;
        }
    }
    @media screen and (max-width: 630px) {
        .header-title p {
            font-size: 20px;
        }
        .header-other p {
            font-size: 15px;
        }
    }
    @media screen and (max-width: 300px) {
        .header-title p {
            padding: 4px 8px;
            font-size: 15px;
        }
        .header-other p {
            padding: 0 5px !important;
            font-size: 10px;
        }
    }
    @media screen and (max-width: 260px) {
        .header-title p {
            font-size: 12px;
        }
        .header-other p {
            font-size: 8px;
        }
    }
    @media screen and (max-width: 200px) {
        .header-title p {
            padding: 5px;
            font-size: 10px;
        }
        .header-other p {
            padding: 0 2px !important;
            font-size: 6px;
        }
    }
</style>