<script lang="ts">
    import "@fontsource/inter/900.css";
    import "@fontsource/open-sans/800-italic.css";

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
        background-color: rgb(41,39,50);
        position: sticky;
        top: 0;
        width: 100%;

        .header-title p,
        .header-other {
            font-family: fantasy;
        }
        .header-title {
            font-size: 30px;
            padding: 20px;
        }
        div {
            display: inline-block;
        }
        a {
            text-decoration: none;
            color: white;
        }
    }
</style>